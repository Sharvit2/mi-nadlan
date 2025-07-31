import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhotoIcon,
  HomeIcon,
  LogoutIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { propertiesAPI, uploadAPI } from '../services/api';

const AgentDashboard = () => {
  const [agentInfo, setAgentInfo] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'sale',
    price: '',
    rooms: '',
    size_sqm: '',
    street: '',
    balcony: false,
    air_conditioning: false,
    parking: false,
    elevator: false,
    renovated: false,
    images: [],
    videos: []
  });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('agentToken');
    const storedAgentInfo = localStorage.getItem('agentInfo');
    
    if (!token || !storedAgentInfo) {
      navigate('/agent-login');
      return;
    }

    const parsedAgentInfo = JSON.parse(storedAgentInfo);
    setAgentInfo(parsedAgentInfo);
    fetchAgentProperties(parsedAgentInfo.name);
  }, [navigate]);

  const fetchAgentProperties = async (agentName) => {
    try {
      const response = await propertiesAPI.getProperties();
      const agentProperties = response.data.filter(prop => prop.agent_name === agentName);
      setProperties(agentProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agentToken');
    localStorage.removeItem('agentInfo');
    navigate('/agent-login');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      property_type: 'sale',
      price: '',
      rooms: '',
      size_sqm: '',
      street: '',
      balcony: false,
      air_conditioning: false,
      parking: false,
      elevator: false,
      renovated: false,
      images: [],
      videos: []
    });
    setEditingProperty(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadAPI.uploadFile(file));
      const responses = await Promise.all(uploadPromises);
      const urls = responses.map(response => response.data.url);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls]
      }));
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const propertyData = {
      ...formData,
      agent_name: agentInfo.name,
      price: parseInt(formData.price),
      rooms: parseInt(formData.rooms),
      size_sqm: parseInt(formData.size_sqm)
    };

    try {
      if (editingProperty) {
        await propertiesAPI.updateProperty(editingProperty.id, propertyData);
      } else {
        await propertiesAPI.createProperty(propertyData);
      }
      
      fetchAgentProperties(agentInfo.name);
      resetForm();
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };

  const handleEdit = (property) => {
    setFormData({
      title: property.title,
      description: property.description,
      property_type: property.property_type,
      price: property.price.toString(),
      rooms: property.rooms.toString(),
      size_sqm: property.size_sqm.toString(),
      street: property.street,
      balcony: property.balcony,
      air_conditioning: property.air_conditioning,
      parking: property.parking,
      elevator: property.elevator,
      renovated: property.renovated,
      images: property.images || [],
      videos: property.videos || []
    });
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm('האם אתם בטוחים שברצונכם למחוק את הנכס?')) {
      try {
        await propertiesAPI.deleteProperty(propertyId);
        fetchAgentProperties(agentInfo.name);
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 font-hebrew">
                דשבורד - {agentInfo?.name}
              </h1>
              <p className="text-gray-600 font-hebrew">
                ניהול הנכסים שלכם
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-hebrew"
            >
              <LogoutIcon className="h-5 w-5" />
              <span>יציאה</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-hebrew">סה"כ נכסים</p>
                <p className="text-3xl font-bold text-primary-600">{properties.length}</p>
              </div>
              <HomeIcon className="h-12 w-12 text-primary-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-hebrew">למכירה</p>
                <p className="text-3xl font-bold text-green-600">
                  {properties.filter(p => p.property_type === 'sale').length}
                </p>
              </div>
              <HomeIcon className="h-12 w-12 text-green-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-hebrew">להשכרה</p>
                <p className="text-3xl font-bold text-blue-600">
                  {properties.filter(p => p.property_type === 'rent').length}
                </p>
              </div>
              <HomeIcon className="h-12 w-12 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-800 font-hebrew">
            הנכסים שלי
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 font-hebrew"
          >
            <PlusIcon className="h-5 w-5" />
            <span>הוספת נכס חדש</span>
          </button>
        </div>

        {/* Property Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-6 font-hebrew">
                  {editingProperty ? 'עריכת נכס' : 'הוספת נכס חדש'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-hebrew">
                        כותרת
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="form-input w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-hebrew">
                        סוג הנכס
                      </label>
                      <select
                        name="property_type"
                        value={formData.property_type}
                        onChange={handleInputChange}
                        className="form-input w-full px-3 py-2 border rounded-md"
                      >
                        <option value="sale">למכירה</option>
                        <option value="rent">להשכרה</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-hebrew">
                      תיאור
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="form-input w-full px-3 py-2 border rounded-md"
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-hebrew">
                        מחיר (₪)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="form-input w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-hebrew">
                        חדרים
                      </label>
                      <input
                        type="number"
                        name="rooms"
                        value={formData.rooms}
                        onChange={handleInputChange}
                        className="form-input w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-hebrew">
                        גודל (מ״ר)
                      </label>
                      <input
                        type="number"
                        name="size_sqm"
                        value={formData.size_sqm}
                        onChange={handleInputChange}
                        className="form-input w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-hebrew">
                        רחוב
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className="form-input w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                  </div>

                  {/* Features Checkboxes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-hebrew">
                      מאפיינים
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {[
                        { name: 'balcony', label: 'מרפסת' },
                        { name: 'air_conditioning', label: 'מיזוג אוויר' },
                        { name: 'parking', label: 'חניה' },
                        { name: 'elevator', label: 'מעלית' },
                        { name: 'renovated', label: 'משופץ' }
                      ].map(feature => (
                        <label key={feature.name} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name={feature.name}
                            checked={formData[feature.name]}
                            onChange={handleInputChange}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm font-hebrew">{feature.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-hebrew">
                      תמונות
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="form-input w-full px-3 py-2 border rounded-md"
                    />
                    {uploading && (
                      <p className="text-sm text-gray-600 mt-2 font-hebrew">מעלה תמונות...</p>
                    )}
                    
                    {/* Display uploaded images */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={`${process.env.REACT_APP_BACKEND_URL}${image}`}
                              alt={`תמונה ${index + 1}`}
                              className="w-full h-20 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-hebrew"
                    >
                      ביטול
                    </button>
                    <button
                      type="submit"
                      className="btn-primary text-white px-6 py-2 rounded-md font-hebrew"
                    >
                      {editingProperty ? 'עדכון' : 'הוספה'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Properties List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <HomeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2 font-hebrew">
                אין נכסים
              </h3>
              <p className="text-gray-500 font-hebrew">
                התחילו בהוספת הנכס הראשון שלכם
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-hebrew">
                      נכס
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-hebrew">
                      סוג
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-hebrew">
                      מחיר
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-hebrew">
                      פרטים
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-hebrew">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {property.images && property.images.length > 0 ? (
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={`${process.env.REACT_APP_BACKEND_URL}${property.images[0]}`}
                                alt={property.title}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <PhotoIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900 font-hebrew">
                              {property.title}
                            </div>
                            <div className="text-sm text-gray-500 font-hebrew">
                              {property.street}, {property.city}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          property.property_type === 'sale'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {property.property_type === 'sale' ? 'למכירה' : 'להשכרה'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-hebrew">
                        ₪{property.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-hebrew">
                        {property.rooms} חדרים • {property.size_sqm} מ״ר
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <a
                            href={`/property/${property.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </a>
                          <button
                            onClick={() => handleEdit(property)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(property.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;