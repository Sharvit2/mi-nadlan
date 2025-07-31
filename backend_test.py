import requests
import sys
import json
from datetime import datetime

class MiNadlanAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_property_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                if 'multipart/form-data' in test_headers.get('Content-Type', ''):
                    response = requests.post(url, data=data, headers={k:v for k,v in test_headers.items() if k != 'Content-Type'})
                else:
                    response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2, ensure_ascii=False)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_office_info(self):
        """Test office info endpoint"""
        success, response = self.run_test("Office Info", "GET", "api/office-info", 200)
        if success:
            expected_fields = ['name', 'address', 'description', 'phone', 'email']
            for field in expected_fields:
                if field not in response:
                    print(f"⚠️  Missing field: {field}")
        return success

    def test_get_agents(self):
        """Test get agents endpoint"""
        success, response = self.run_test("Get Agents", "GET", "api/agents", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} agents")
            expected_agents = ["איתמר", "מתן", "עדן", "ליטל"]
            found_agents = [agent.get('name', '') for agent in response]
            for expected_agent in expected_agents:
                if expected_agent in found_agents:
                    print(f"   ✅ Found agent: {expected_agent}")
                else:
                    print(f"   ❌ Missing agent: {expected_agent}")
        return success

    def test_agent_login(self):
        """Test agent login"""
        success, response = self.run_test(
            "Agent Login", 
            "POST", 
            "api/auth/login", 
            200,
            headers={'Content-Type': 'multipart/form-data'},
            data={"agent_name": "איתמר"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   ✅ Login successful, token received")
            return True
        return False

    def test_get_properties(self):
        """Test get all properties"""
        return self.run_test("Get All Properties", "GET", "api/properties", 200)

    def test_get_sale_properties(self):
        """Test get sale properties"""
        return self.run_test("Get Sale Properties", "GET", "api/properties/sale", 200)

    def test_get_rent_properties(self):
        """Test get rent properties"""
        return self.run_test("Get Rent Properties", "GET", "api/properties/rent", 200)

    def test_property_filtering(self):
        """Test property filtering"""
        # Test price filtering
        success1, _ = self.run_test("Filter by Min Price", "GET", "api/properties?min_price=1000000", 200)
        success2, _ = self.run_test("Filter by Max Price", "GET", "api/properties?max_price=2000000", 200)
        success3, _ = self.run_test("Filter by Rooms", "GET", "api/properties?rooms=3", 200)
        success4, _ = self.run_test("Filter by Street", "GET", "api/properties?street=בן", 200)
        
        return all([success1, success2, success3, success4])

    def test_create_property(self):
        """Test create property"""
        test_property = {
            "title": "דירת 3 חדרים למכירה - בדיקה",
            "description": "דירה יפה ומרווחת בבית שמש",
            "property_type": "sale",
            "price": 1500000,
            "rooms": 3,
            "size_sqm": 80,
            "street": "רחוב הבדיקה",
            "city": "בית שמש",
            "balcony": True,
            "air_conditioning": True,
            "parking": False,
            "elevator": True,
            "renovated": False,
            "agent_name": "איתמר",
            "images": [],
            "videos": []
        }
        
        success, response = self.run_test("Create Property", "POST", "api/properties", 201, data=test_property)
        if success and 'id' in response:
            self.test_property_id = response['id']
            print(f"   ✅ Property created with ID: {self.test_property_id}")
        return success

    def test_get_property_by_id(self):
        """Test get property by ID"""
        if not self.test_property_id:
            print("❌ No test property ID available")
            return False
        
        return self.run_test("Get Property by ID", "GET", f"api/properties/{self.test_property_id}", 200)

    def test_update_property(self):
        """Test update property"""
        if not self.test_property_id:
            print("❌ No test property ID available")
            return False
        
        update_data = {
            "title": "דירת 3 חדרים למכירה - עודכן",
            "description": "דירה יפה ומרווחת בבית שמש - עודכן",
            "property_type": "sale",
            "price": 1600000,
            "rooms": 3,
            "size_sqm": 80,
            "street": "רחוב הבדיקה",
            "city": "בית שמש",
            "balcony": True,
            "air_conditioning": True,
            "parking": True,
            "elevator": True,
            "renovated": True,
            "agent_name": "איתמר",
            "images": [],
            "videos": []
        }
        
        return self.run_test("Update Property", "PUT", f"api/properties/{self.test_property_id}", 200, data=update_data)

    def test_delete_property(self):
        """Test delete property"""
        if not self.test_property_id:
            print("❌ No test property ID available")
            return False
        
        return self.run_test("Delete Property", "DELETE", f"api/properties/{self.test_property_id}", 200)

    def test_invalid_endpoints(self):
        """Test invalid endpoints return proper errors"""
        success1, _ = self.run_test("Invalid Property ID", "GET", "api/properties/invalid-id", 404)
        success2, _ = self.run_test("Invalid Agent Login", "POST", "api/auth/login", 422, 
                                  headers={'Content-Type': 'multipart/form-data'},
                                  data={"agent_name": "לא קיים"})
        
        return success1 and success2

def main():
    print("🏠 Mi Nadlan API Testing Suite")
    print("=" * 50)
    
    # Setup
    tester = MiNadlanAPITester("http://localhost:8001")
    
    # Run tests in order
    test_methods = [
        tester.test_root_endpoint,
        tester.test_office_info,
        tester.test_get_agents,
        tester.test_agent_login,
        tester.test_get_properties,
        tester.test_get_sale_properties,
        tester.test_get_rent_properties,
        tester.test_property_filtering,
        tester.test_create_property,
        tester.test_get_property_by_id,
        tester.test_update_property,
        tester.test_delete_property,
        tester.test_invalid_endpoints
    ]
    
    for test_method in test_methods:
        try:
            test_method()
        except Exception as e:
            print(f"❌ Test {test_method.__name__} failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())