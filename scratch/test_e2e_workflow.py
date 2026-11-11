import urllib.request
import json
import sys

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000/api/v1"

def post(url, data=None, token=None):
    req_data = json.dumps(data).encode('utf-8') if data else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=req_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get(url, token=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

print("=== STARTING END-TO-END WORKFLOW TEST ===")

# Step 1: Register a new user
import time
unique_id = int(time.time())
test_email = f"e2e_traveler_{unique_id}@travelmate.com"
test_name = f"Kavya Patel {unique_id % 1000}"
test_password = "E2ePassword@123"

print(f"\n[1] Registering user: {test_email}...")
reg_res = post(f"{BASE_URL}/auth/register", {
    "email": test_email,
    "name": test_name,
    "password": test_password
})
assert "access_token" in reg_res, "Registration failed to return access_token"
user_id = reg_res["user"]["id"]
print(f" -> User registered successfully. ID: {user_id}, Name: {reg_res['user']['name']}")

# Step 2: Log in as that user
print(f"\n[2] Logging in as {test_email}...")
login_res = post(f"{BASE_URL}/auth/login", {
    "email": test_email,
    "password": test_password
})
user_token = login_res["access_token"]
assert user_token, "Login failed to return access_token"
print(f" -> Logged in successfully. Token acquired.")

# Step 3, 4, 5: Save Travel Preferences
print(f"\n[3, 4, 5] Submitting travel preferences (Interests, Budget, Duration, Location, Companion, Season)...")
pref_payload = {
    "interests": ["Historical Places", "Nature and Wildlife", "Hill Stations"],
    "budget_tier": "₹10,000–₹20,000",
    "budget_amount": 16000.0,
    "duration_tier": "3 Days",
    "duration_days": 3,
    "starting_state": "Karnataka",
    "starting_city": "Bengaluru",
    "companion_type": "Family",
    "travel_month_or_season": "Winter (Nov - Feb)"
}
saved_pref = post(f"{BASE_URL}/preferences", pref_payload, token=user_token)
assert saved_pref["id"] is not None, "Preference save failed"
print(f" -> Preferences saved in SQLite. User ID: {saved_pref['user_id']}, Budget: Rs.{saved_pref['budget_amount']}, Duration: {saved_pref['duration_days']} Days")

# Verify updating preferences updates existing record instead of duplicate
print(f" -> Testing updating existing preferences...")
pref_payload["budget_amount"] = 18000.0
updated_pref = post(f"{BASE_URL}/preferences", pref_payload, token=user_token)
assert updated_pref["id"] == saved_pref["id"], "Preference update created duplicate ID instead of updating existing record!"
print(f" -> Preference update verified: Record ID {updated_pref['id']} preserved without duplication.")

# Step 6: Generate Day-wise Itinerary
print(f"\n[6] Generating day-wise itinerary solely via Bayesian Popularity Ranking...")
gen_itinerary = post(f"{BASE_URL}/itineraries/generate", pref_payload, token=user_token)
assert "days" in gen_itinerary, "Itinerary generation failed"
assert len(gen_itinerary["days"]) == 3, f"Expected 3 days, got {len(gen_itinerary['days'])}"
print(f" -> Itinerary generated: '{gen_itinerary['title']}' across {len(gen_itinerary['days'])} days.")
for d in gen_itinerary["days"]:
    print(f"    Day {d['day']}: Morning='{d['morning']['destination']['name']}', Afternoon='{d['afternoon']['destination']['name']}', Evening='{d['evening']['destination']['name']}'")

# Step 7: Save the trip in SQLite
print(f"\n[7] Saving generated trip to database...")
save_trip_res = post(f"{BASE_URL}/itineraries/save", {
    "title": "Kavya's Karnataka Family Vacation",
    "itinerary_data": gen_itinerary
}, token=user_token)
trip_id = save_trip_res["id"]
assert trip_id is not None, "Trip save failed"
print(f" -> Trip saved in SQLite. Trip ID: {trip_id}, Title: '{save_trip_res['title']}', Est Cost: Rs.{save_trip_res['total_estimated_cost']}")

# Step 8: User Logout (client token discarded)
print(f"\n[8] User logged out (token cleared).")
user_token = None

# Step 9: Log in as Administrator
print(f"\n[9] Logging in as Administrator (admin@travelmate.com)...")
admin_login_res = post(f"{BASE_URL}/admin/login", {
    "email": "admin@travelmate.com",
    "password": "AdminPassword@123"
})
admin_token = admin_login_res["access_token"]
assert admin_login_res["user"]["role"] == "admin", "User is not an admin"
print(f" -> Admin logged in successfully.")

# Step 10 & 11: Open User Management and find newly registered user
print(f"\n[10 & 11] Admin fetching users list to find {test_email}...")
users_list = get(f"{BASE_URL}/admin/users?query={test_email}", token=admin_token)
assert users_list["total"] >= 1, "Newly registered user not found in admin user list"
found_user = next((u for u in users_list["users"] if u["email"] == test_email), None)
assert found_user is not None, "User email mismatch"
print(f" -> User found in Admin User Management list:")
print(f"    ID: #{found_user['id']}")
print(f"    Name: {found_user['name']}")
print(f"    Email: {found_user['email']}")
print(f"    Role: {found_user['role']}")
print(f"    Status: {'Active' if found_user['is_active'] else 'Deactivated'}")
print(f"    Interests: {found_user.get('interests')}")
print(f"    Budget: {found_user.get('budget_tier')}")
print(f"    Duration: {found_user.get('duration_tier')}")
print(f"    Saved Trips Count: {found_user.get('saved_trips_count')}")

# Step 12 & 13: Open user profile and verify preferences and saved itinerary
print(f"\n[12 & 13] Admin opening profile for User #{found_user['id']}...")
detail = get(f"{BASE_URL}/admin/users/{found_user['id']}", token=admin_token)

assert detail["user"]["email"] == test_email, "Detail profile email mismatch"
assert detail["preferences"] is not None, "Preferences missing from user detail"
assert "Historical Places" in detail["preferences"]["interests"], "Interests mismatch"
assert detail["preferences"]["starting_city"] == "Bengaluru", "Starting city mismatch"
assert detail["preferences"]["starting_state"] == "Karnataka", "Starting state mismatch"
assert detail["preferences"]["budget_amount"] == 18000.0, "Budget amount mismatch"
assert detail["preferences"]["duration_days"] == 3, "Duration mismatch"

assert len(detail["saved_trips"]) >= 1, "Saved trips missing from user detail"
saved_t = detail["saved_trips"][0]
assert saved_t["id"] == trip_id, "Trip ID mismatch"
assert saved_t["title"] == "Kavya's Karnataka Family Vacation", "Trip title mismatch"
assert len(saved_t["itinerary"]) == 3, "Itinerary days count mismatch"
assert saved_t["estimated_accommodation"] > 0, "Accommodation expense missing"
assert saved_t["estimated_food"] > 0, "Food expense missing"
assert saved_t["total_estimated_cost"] > 0, "Total cost missing"

print(f" -> PROFILE VERIFIED:")
print(f"    Profile Name: {detail['user']['name']}")
print(f"    Registered Preferences: {detail['preferences']['starting_city']}, {detail['preferences']['starting_state']} | Budget: Rs.{detail['preferences']['budget_amount']} | Duration: {detail['preferences']['duration_days']} Days")
print(f"    Interests: {detail['preferences']['interests']}")
print(f"    Saved Trip Title: '{saved_t['title']}'")
print(f"    Projected Cost: Rs.{saved_t['total_estimated_cost']} (Lodging: Rs.{saved_t['estimated_accommodation']}, Food: Rs.{saved_t['estimated_food']}, Transit: Rs.{saved_t['estimated_transport']}, Fees: Rs.{saved_t['estimated_entrance_fees']})")
print(f"    Day-wise Destinations Verified: {len(saved_t['itinerary'])} scheduled days present.")

print(f"\n[14] Checking Admin Stats KPIs...")
stats = get(f"{BASE_URL}/admin/stats", token=admin_token)
print(f"    Total Users: {stats['total_users']}")
print(f"    Active Users: {stats['active_users']}")
print(f"    Inactive Users: {stats['inactive_users']}")
print(f"    Total Trips: {stats['total_trips']}")
print(f"    Total Destinations: {stats['total_destinations']}")

print(f"\n[15] Checking Admin Security (Non-admin access restriction)...")
try:
    fake_user_login = post(f"{BASE_URL}/auth/login", {
        "email": test_email,
        "password": test_password
    })
    non_admin_token = fake_user_login["access_token"]
    # Attempt to fetch admin stats with non-admin token
    get(f"{BASE_URL}/admin/stats", token=non_admin_token)
    print("ERROR: Non-admin was able to access admin stats!")
    sys.exit(1)
except urllib.error.HTTPError as e:
    assert e.code == 403, f"Expected 403 Forbidden, got {e.code}"
    print(f" -> Non-admin successfully blocked with HTTP {e.code} Forbidden.")

print("\n>>> ALL 13 WORKFLOW STEPS & SECURITY CHECKS PASSED WITH 100% ACCURACY! <<<")
