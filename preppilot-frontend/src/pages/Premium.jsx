import { Crown, Check, Zap, Brain, Mail } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useState } from 'react';

const features = [
  { icon: Brain, text: 'Unlimited AI analyses (OA paper, JD, prep plans)' },
  { icon: Zap, text: 'Priority AI response speed' },
  { icon: Mail, text: 'Deadline email reminders' },
  { icon: Check, text: 'All future features included' },
];

export default function Premium() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/payment/create-order');
      const { orderId, amount, keyId } = res.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: 'INR',
        name: 'PrepPilot',
        description: 'Unlock Premium — Unlimited AI Analyses',
        order_id: orderId,
        handler: function (response) {
          toast.success('Payment successful! Premium unlocked 🎉');
          setTimeout(() => window.location.reload(), 1500);
        },
        prefill: { email: user?.email, name: user?.name },
        theme: { color: '#7c3aed' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Go Premium</h1>
            <p className="page-subtitle">Unlock unlimited AI power for your placements</p>
          </div>
        </div>

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>

          {user?.isPremium ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 24px rgba(251,191,36,0.35)'
              }}>
                <Crown size={32} color="white" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>
                You're Premium! ⭐
              </h2>
              <p style={{ color: 'var(--gray-400)', fontSize: '14px', lineHeight: 1.7 }}>
                You have access to unlimited AI analyses, priority support,
                and all future premium features.
              </p>
            </div>
          ) : (
            <>
              {/* Banner */}
              <div className="premium-banner" style={{ marginBottom: '20px' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Crown size={24} color="#fbbf24" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)',
                      textTransform: 'uppercase', letterSpacing: '1px' }}>
                      PrepPilot Premium
                    </span>
                  </div>
                  <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', lineHeight: 1.2 }}>
                    Unlock Unlimited<br />AI Analyses
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                    Free users get 3 analyses. Go premium for unlimited.
                  </p>
                </div>
              </div>

              {/* Pricing Card */}
              <div className="card" style={{ textAlign: 'center', padding: '36px 32px' }}>
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '6px' }}>
                    One-time payment
                  </div>
                  <div style={{
                    fontSize: '48px', fontWeight: 800, color: 'var(--purple-primary)',
                    letterSpacing: '-2px', lineHeight: 1
                  }}>
                    ₹499
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--gray-400)', marginTop: '4px' }}>
                    Lifetime access
                  </div>
                </div>

                {/* Features */}
                <div style={{ textAlign: 'left', marginBottom: '28px' }}>
                  {features.map(({ icon: Icon, text }, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 0',
                      borderBottom: i < features.length - 1 ? '1px solid var(--gray-100)' : 'none'
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'var(--purple-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon size={16} color="var(--purple-primary)" />
                      </div>
                      <span style={{ fontSize: '14px', color: 'var(--gray-800)' }}>{text}</span>
                    </div>
                  ))}
                </div>

                <button className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
                  onClick={handlePayment}
                  disabled={loading}>
                  <Crown size={17} />
                  {loading ? 'Processing...' : 'Upgrade to Premium — ₹499'}
                </button>

                <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '14px' }}>
                  Secured by Razorpay • Test mode active
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}