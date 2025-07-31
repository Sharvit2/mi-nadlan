import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { agentsAPI, officeAPI } from '../services/api';

const HomePage = () => {
  const [agents, setAgents] = useState([]);
  const [officeInfo, setOfficeInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsResponse, officeResponse] = await Promise.all([
          agentsAPI.getAgents(),
          officeAPI.getOfficeInfo()
        ]);
        setAgents(agentsResponse.data);
        setOfficeInfo(officeResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-bg min-h-screen flex items-center justify-center text-white">
        <div className="container-custom text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-shadow font-hebrew">
            מי נדל"ן
          </h1>
          <h2 className="text-2xl md:text-4xl mb-8 text-shadow font-hebrew">
            בית שמש
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-shadow font-hebrew">
            {officeInfo.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/sale"
              className="btn-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg font-hebrew"
            >
              נכסים למכירה
            </Link>
            <Link
              to="/rent"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 hover:shadow-lg font-hebrew"
            >
              נכסים להשכרה
            </Link>
          </div>
        </div>
      </section>

      {/* Office Info Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 font-hebrew">
            אודות המשרד
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-primary-600 font-hebrew">
                מי אנחנו?
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-8 font-hebrew">
                {officeInfo.description}
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <MapPinIcon className="h-6 w-6 text-primary-500" />
                  <span className="text-gray-700 font-hebrew">{officeInfo.address}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <PhoneIcon className="h-6 w-6 text-primary-500" />
                  <span className="text-gray-700 font-hebrew">{officeInfo.phone}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <EnvelopeIcon className="h-6 w-6 text-primary-500" />
                  <span className="text-gray-700 font-hebrew">{officeInfo.email}</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-xl">
              <h4 className="text-xl font-semibold mb-6 text-primary-800 font-hebrew">
                למה לבחור בנו?
              </h4>
              <ul className="space-y-3 text-gray-700 font-hebrew">
                <li className="flex items-start space-x-3">
                  <span className="text-primary-500">✓</span>
                  <span>מקצועיות ברמה הגבוהה ביותר</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-500">✓</span>
                  <span>יחס אישי וחם לכל לקוח</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-500">✓</span>
                  <span>שקיפות מלאה בכל התהליך</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-500">✓</span>
                  <span>הכרת השוק המקומי בבית שמש</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-500">✓</span>
                  <span>ליווי מקצועי מההתחלה ועד לסיום</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800 font-hebrew">
            הצוות שלנו
          </h2>
          <p className="text-xl text-center text-gray-600 mb-16 font-hebrew">
            רכשו עם המקצוענים שמכירים את בית שמש
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {agents.map((agent) => (
              <div key={agent.id} className="agent-card p-6 rounded-xl text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <UserGroupIcon className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 font-hebrew">
                  {agent.name}
                </h3>
                <p className="text-gray-600 mb-3 font-hebrew">סוכן נדל"ן</p>
                {agent.phone && (
                  <p className="text-primary-600 font-semibold font-hebrew">
                    {agent.phone}
                  </p>
                )}
                <div className="mt-4 text-sm text-gray-500 font-hebrew">
                  {agent.properties_count} נכסים פעילים
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 font-hebrew">
            השירותים שלנו
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/sale" className="group">
              <div className="property-card bg-white p-8 rounded-xl text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl text-white">🏠</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800 font-hebrew">
                  נכסים למכירה
                </h3>
                <p className="text-gray-600 mb-6 font-hebrew">
                  מגוון רחב של דירות ובתים למכירה בבית שמש ובסביבה. 
                  כל הנכסים נבחרו בקפידה ומוצעים במחירים הוגנים.
                </p>
                <span className="btn-primary text-white px-6 py-3 rounded-lg font-semibold group-hover:shadow-lg font-hebrew">
                  עיון בנכסים למכירה
                </span>
              </div>
            </Link>
            
            <Link to="/rent" className="group">
              <div className="property-card bg-white p-8 rounded-xl text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl text-white">🔑</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800 font-hebrew">
                  נכסים להשכרה
                </h3>
                <p className="text-gray-600 mb-6 font-hebrew">
                  דירות ובתים להשכרה בכל רחבי בית שמש. 
                  מבחר איכותי של נכסים למשפחות ויחידים.
                </p>
                <span className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold group-hover:shadow-lg font-hebrew">
                  עיון בנכסים להשכרה
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6 font-hebrew">
            מוכנים להתחיל?
          </h2>
          <p className="text-xl mb-8 font-hebrew">
            צרו קשר עוד היום ותנו לנו לעזור לכם למצוא את הבית המושלם
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${officeInfo.phone}`}
              className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 hover:shadow-lg font-hebrew"
            >
              התקשרו עכשיו
            </a>
            <a
              href={`https://wa.me/972${officeInfo.whatsapp?.replace(/^0/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg font-hebrew"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;