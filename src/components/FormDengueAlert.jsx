import React, { useState } from 'react';
import { useGetBarangaysQuery, useSendDengueAlertMutation, useGetPatternRecognitionResultsQuery } from '../api/dengueApi';
import { AlertCircle, Plus, X } from 'phosphor-react';

const FormDengueAlert = () => {
  const [selectedBarangays, setSelectedBarangays] = useState([]);
  const [messages, setMessages] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: barangays, isLoading } = useGetBarangaysQuery();
  const [sendAlert] = useSendDengueAlertMutation();
  const { data: patternResultsData } = useGetPatternRecognitionResultsQuery();
  const patternResults = patternResultsData?.data || [];

  // Helper to extract barangay name without risk level
  const getCleanBarangayName = (name) => name.replace(/\s*\(.*?\)\s*$/, '').trim();

  // Helper to get pattern for a barangay
  const getPatternForBarangay = (barangayName) => {
    if (!patternResults) return 'No pattern';
    const cleanName = getCleanBarangayName(barangayName);
    const match = patternResults.find(
      (item) => item.name?.toLowerCase().replace(/barangay /g, '').trim() === cleanName.toLowerCase().replace(/barangay /g, '').trim()
    );
    return match?.triggered_pattern
      ? match.triggered_pattern.charAt(0).toUpperCase() + match.triggered_pattern.slice(1).replace('_', ' ')
      : 'No pattern';
  };

  const handleBarangayChange = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setSelectedBarangays(selectedValues);
  };

  const handleMessageChange = (index, value) => {
    const newMessages = [...messages];
    newMessages[index] = value;
    setMessages(newMessages);
  };

  const addMessage = () => {
    setMessages([...messages, '']);
  };

  const removeMessage = (index) => {
    const newMessages = messages.filter((_, i) => i !== index);
    setMessages(newMessages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const alertData = {
        barangayIds: selectedBarangays,
        messages: messages.filter(msg => msg.trim() !== ''),
      };

      await sendAlert(alertData).unwrap();
      setShowSuccess(true);
      setSelectedBarangays([]);
      setMessages(['']);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to send alert:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle size={24} className="text-error" weight="fill" />
        <h2 className="text-2xl font-bold">Send Dengue Alert</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Barangay Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Barangays
          </label>
          <div className="relative">
            <select
              multiple
              value={selectedBarangays}
              onChange={handleBarangayChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]"
            >
              {barangays?.map((barangay) => {
                const cleanName = getCleanBarangayName(barangay.name);
                return (
                  <option 
                    key={barangay._id} 
                    value={barangay._id}
                    className="p-2 hover:bg-primary/10 cursor-pointer"
                  >
                    {cleanName}
                  </option>
                );
              })}
            </select>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedBarangays.map((barangayId) => {
                const barangay = barangays?.find(b => b._id === barangayId);
                return barangay ? (
                  <div 
                    key={barangayId}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {barangay.name}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBarangays(prev => 
                          prev.filter(id => id !== barangayId)
                        );
                      }}
                      className="hover:text-error"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Hold Ctrl/Cmd to select multiple barangays or click to select/deselect
          </p>
        </div>

        {/* Messages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alert Messages
          </label>
          {messages.map((message, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={message}
                onChange={(e) => handleMessageChange(index, e.target.value)}
                placeholder="Enter alert message"
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMessage(index)}
                  className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMessage}
            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
          >
            <Plus size={20} />
            Add another message
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || selectedBarangays.length === 0}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${
            isSubmitting || selectedBarangays.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-error hover:bg-error/80'
          }`}
        >
          {isSubmitting ? 'Sending Alert...' : 'Send Alert'}
        </button>

        {/* Success Message */}
        {showSuccess && (
          <div className="p-3 bg-success/10 text-success rounded-lg">
            Alert sent successfully!
          </div>
        )}
      </form>
    </div>
  );
};

export default FormDengueAlert; 