import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { agentsAPI } from '../services/api';

const AgentLogin = () => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const agents = ['איתמר', 'מתן', 'עדן', 'ליטל'];

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!selectedAgent) {
      setError('אנא בחרו סוכן');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await agentsAPI.login(selectedAgent);
      
      // Store authentication info
      localStorage.setItem('agentToken', response.data.token);
      localStorage.setItem('agentInfo', JSON.stringify(response.data.agent));
      
      // Redirect to dashboard
      navigate('/agent-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('שגיאה בהתחברות. נסו שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
            <UserIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 font-hebrew">
            כניסת סוכנים
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-hebrew">
            בחרו את שמכם כדי להיכנס למערכת
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="agent" className="block text-sm font-medium text-gray-700 mb-2 font-hebrew">
              בחירת סוכן
            </label>
            <select
              id="agent"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="form-input appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              required
            >
              <option value="">בחרו סוכן...</option>
              {agents.map((agent) => (
                <option key={agent} value={agent} className="font-hebrew">
                  {agent}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-hebrew">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 font-hebrew"
            >
              {loading ? (
                <div className="loading-spinner w-5 h-5"></div>
              ) : (
                <>
                  <span className="absolute left-3 inset-y-0 flex items-center">
                    <ArrowRightIcon className="h-5 w-5 text-primary-300" />
                  </span>
                  כניסה למערכת
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2 font-hebrew">
            הוראות לסוכנים:
          </h3>
          <ul className="text-xs text-blue-700 space-y-1 font-hebrew">
            <li>• בחרו את שמכם מהרשימה</li>
            <li>• לחצו "כניסה למערכת"</li>
            <li>• תוכלו להוסיף ולערוך נכסים</li>
            <li>• העלו תמונות וסרטונים איכותיים</li>
          </ul>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 font-hebrew">
            אם יש לכם בעיות בכניסה, צרו קשר עם מנהל המערכת
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentLogin;