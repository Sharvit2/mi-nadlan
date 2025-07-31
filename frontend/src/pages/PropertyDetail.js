import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  HomeIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ArrowRightIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { propertiesAPI } from '../services/api';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await propertiesAPI.getProperty(id);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <HomeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2 font-hebrew">
            הנכס לא נמצא
          </h2>
          <p className="text-gray-500 mb-6 font-hebrew">
            הנכס שחיפשתם אינו קיים או הוסר
          </p>
          <Link 
            to="/" 
            className="btn-primary text-white px-6 py-3 rounded-lg font-semibold font-hebrew"
          >
            חזרה לעמוד הבית
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 mb-8 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary-600 font-hebrew">עמוד הבית</Link>
          <ArrowRightIcon className="h-4 w-4" />
          <Link 
            to={property.property_type === 'sale' ? '/sale' : '/rent'} 
            className="hover:text-primary-600 font-hebrew"
          >
            {property.property_type === 'sale' ? 'נכסים למכירה' : 'נכסים להשכרה'}
          </Link>
          <ArrowRightIcon className="h-4 w-4" />
          <span className="text-gray-700 font-hebrew">{property.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images Section */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md mb-6">
              {property.images && property.images.length > 0 ? (
                <div>
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}${property.images[selectedImageIndex]}`}
                    alt={property.title}
                    className="w-full h-96 object-cover"
                  />
                  {/* Image thumbnails */}
                  {property.images.length > 1 && (
                    <div className="p-4">
                      <div className="flex space-x-2 overflow-x-auto">
                        {property.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                              selectedImageIndex === index 
                                ? 'border-primary-500' 
                                : 'border-gray-200'
                            }`}
                          >
                            <img
                              src={`${process.env.REACT_APP_BACKEND_URL}${image}`}
                              alt={`תמונה ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <HomeIcon className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white mb-4 ${
                    property.property_type === 'sale' ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {property.property_type === 'sale' ? 'למכירה' : 'להשכרה'}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-800 font-hebrew">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mt-2">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span className="font-hebrew">{property.street}, {property.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    property.property_type === 'sale' ? 'text-green-600' : 'text-blue-600'
                  } font-hebrew`}>
                    {formatPrice(property.price)}
                    {property.property_type === 'rent' && (
                      <span className="text-lg text-gray-500 font-normal">/חודש</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {property.rooms}
                  </div>
                  <div className="text-sm text-gray-600 font-hebrew">חדרים</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {property.size_sqm}
                  </div>
                  <div className="text-sm text-gray-600 font-hebrew">מ״ר</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {Math.floor(property.price / property.size_sqm).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 font-hebrew">₪ למ״ר</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600 mb-1 font-hebrew">
                    {property.agent_name}
                  </div>
                  <div className="text-sm text-gray-600 font-hebrew">סוכן</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 font-hebrew">תיאור הנכס</h2>
                <p className="text-gray-700 leading-relaxed font-hebrew">
                  {property.description}
                </p>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 font-hebrew">מאפיינים</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    {property.balcony ? (
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XMarkIcon className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-hebrew">מרפסת</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {property.air_conditioning ? (
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XMarkIcon className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-hebrew">מיזוג אוויר</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {property.parking ? (
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XMarkIcon className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-hebrew">חניה</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {property.elevator ? (
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XMarkIcon className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-hebrew">מעלית</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {property.renovated ? (
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XMarkIcon className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-hebrew">משופץ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6 font-hebrew">צרו קשר</h2>
              
              {/* Agent Info */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {property.agent_name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 font-hebrew">
                  {property.agent_name}
                </h3>
                <p className="text-gray-600 font-hebrew">סוכן נדל"ן</p>
              </div>

              {/* Contact Buttons */}
              <div className="space-y-3">
                <a
                  href="tel:052-1234567"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold text-center block transition-colors font-hebrew"
                >
                  <PhoneIcon className="h-5 w-5 inline mr-2" />
                  התקשרו עכשיו
                </a>
                
                <a
                  href="https://wa.me/972521234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold text-center block transition-colors font-hebrew"
                >
                  WhatsApp
                </a>
                
                <a
                  href="mailto:info@minadlan.co.il"
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold text-center block transition-colors font-hebrew"
                >
                  <EnvelopeIcon className="h-5 w-5 inline mr-2" />
                  שלחו מייל
                </a>
              </div>

              {/* Quick Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold mb-3 font-hebrew">פרטים מהירים</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-hebrew">מספר נכס:</span>
                    <span>{property.id.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-hebrew">תאריך פרסום:</span>
                    <span>{new Date(property.created_at).toLocaleDateString('he-IL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-hebrew">עדכון אחרון:</span>
                    <span>{new Date(property.updated_at).toLocaleDateString('he-IL')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;