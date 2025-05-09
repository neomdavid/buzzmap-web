import { useState } from "react";
import { IconAlertCircle, IconPlus, IconX, IconChevronDown } from '@tabler/icons-react';
import { useGetBarangaysQuery, useSendDengueAlertMutation } from '../../api/dengueApi';

const FormDengueAlert = () => {
  const [selectedBarangays, setSelectedBarangays] = useState([]);
  const [messages, setMessages] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: barangays } = useGetBarangaysQuery();
  const [sendAlert] = useSendDengueAlertMutation();

  const handleBarangayChange = (e) => {
    const value = e.target.value;
    if (value === "") return;
    
    if (selectedBarangays.includes(value)) {
      setSelectedBarangays(prev => prev.filter(id => id !== value));
    } else {
      setSelectedBarangays(prev => [...prev, value]);
    }
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
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to send alert:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col rounded-xl overflow-hidden shadow-md border border-gray-200 bg-white max-w-5xl">
      <div className="w-full bg-error text-white text-center py-3">
        <div className="flex items-center justify-center gap-2">
          <IconAlertCircle size={24} stroke={2} />
          <p className="text-xl font-semibold">Send Dengue Alert</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6">
        {/* Barangay Selection */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-primary font-semibold">
            Select Barangays <span className="text-error">*</span>
          </label>
          <div className="relative">
            <select
              value=""
              onChange={handleBarangayChange}
              className="w-full p-2.5 pr-8 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="" disabled>Select barangays</option>
              {barangays?.map((barangay) => (
                <option key={barangay._id} value={barangay._id}>
                  {barangay.name} ({barangay.risk_level})
                </option>
              ))}
            </select>
            <IconChevronDown className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" size={18} />
          </div>
          
          {/* Selected Barangays Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedBarangays.map((barangayId) => {
              const barangay = barangays?.find(b => b._id === barangayId);
              return barangay ? (
                <div key={barangayId} className="bg-error/10 text-error px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {barangay.name}
                  <button
                    type="button"
                    onClick={() => setSelectedBarangays(prev => prev.filter(id => id !== barangayId))}
                    className="hover:text-error-dark"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Alert Messages */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-primary font-semibold">
            Alert Messages <span className="text-error">*</span>
          </label>
          {messages.map((message, index) => (
            <div key={index} className="flex gap-2">
              <textarea
                value={message}
                onChange={(e) => handleMessageChange(index, e.target.value)}
                placeholder="Type your alert message here..."
                className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none min-h-[80px]"
                required
              />
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMessage(index)}
                  className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                >
                  <IconX size={20} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMessage}
            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors w-fit"
          >
            <IconPlus size={20} />
            Add another message
          </button>
        </div>

        {/* Submit Button */}
        <div className="w-full flex justify-center mt-4">
          <button
            type="submit"
            disabled={isSubmitting || selectedBarangays.length === 0}
            className={`bg-error hover:bg-error-dark transition-all duration-300 rounded-full font-semibold text-white py-2 px-8 text-lg shadow-md hover:cursor-pointer hover:bg-error/90 disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? 'Sending Alert...' : 'Send Alert'}
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="p-3 bg-success/10 text-success rounded-lg text-center">
            Alert sent successfully!
          </div>
        )}
      </div>
    </form>
  );
};

export default FormDengueAlert;
