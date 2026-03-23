#!/bin/bash
set -e
BASE="http://localhost:3000/api"

echo "--- 1. Register PT ---"
PT_RES=$(curl -s -X POST $BASE/auth/register -H "Content-Type: application/json" -d '{"email":"pt22@test.com","password":"Test1234!","role":"PT"}')
PT_TOKEN=$(echo $PT_RES | jq -r '.tokens.accessToken')
echo "Token: ${PT_TOKEN:0:15}..."

echo "--- 2. GET Workout Plans ---"
curl -s -X GET $BASE/workout-plans -H "Authorization: Bearer $PT_TOKEN" | jq '.[].name'

echo "--- 3. Create Custom Plan ---"
PLAN_RES=$(curl -s -X POST $BASE/workout-plans -H "Authorization: Bearer $PT_TOKEN" -H "Content-Type: application/json" -d '{"name":"Custom","totalDays":1,"days":[{"dayNumber":1,"label":"Day1","exercises":[{"name":"Pushups","sets":3,"reps":"10"}]}]}')
PLAN_ID=$(echo $PLAN_RES | jq -r '.id')
echo "Created Plan: $PLAN_ID"

echo "--- 4. Create Availability ---"
AVAIL_RES=$(curl -s -X POST $BASE/availability -H "Authorization: Bearer $PT_TOKEN" -H "Content-Type: application/json" -d '{"date":"2026-05-01","startTime":"10:00","endTime":"11:00","sessionName":"Morning","isRepeat":false}')
AVAIL_ID=$(echo $AVAIL_RES | jq -r 'if type=="array" then .[0].id else .id end')
echo "Created Avail: $AVAIL_ID"

echo "--- 5. Create Client ---"
CLIENT_RES=$(curl -s -X POST $BASE/clients -H "Authorization: Bearer $PT_TOKEN" -H "Content-Type: application/json" -d '{"firstName":"Bob","lastName":"Smith","email":"bob2@test.com","phone":"123"}')
CLIENT_ID=$(echo $CLIENT_RES | jq -r '.id')
echo "Created Client: $CLIENT_ID"

echo "--- 6. Book Slot ---"
curl -s -X POST $BASE/bookings -H "Authorization: Bearer $PT_TOKEN" -H "Content-Type: application/json" -d "{\"availabilityId\":\"$AVAIL_ID\",\"clientId\":\"$CLIENT_ID\"}" | jq -r '.status'

echo "--- 7. Double Book (Should be 409) ---"
curl -s -X POST $BASE/bookings -H "Authorization: Bearer $PT_TOKEN" -H "Content-Type: application/json" -d "{\"availabilityId\":\"$AVAIL_ID\",\"clientId\":\"$CLIENT_ID\"}" | jq -r 'if .statusCode then .message else .status end'

echo "--- 8. Register OWNER -> View All Plans ---"
OWNER_RES=$(curl -s -X POST $BASE/auth/register -H "Content-Type: application/json" -d '{"email":"owner22@test.com","password":"Test1234!","role":"OWNER"}')
OWNER_TOKEN=$(echo $OWNER_RES | jq -r '.tokens.accessToken')
curl -s -X GET $BASE/workout-plans -H "Authorization: Bearer $OWNER_TOKEN" | jq '.[].name'

echo "All tests completed."
