import { useEffect, useState } from 'react'; import { useLanguage } from '../context/LanguageContext';
export default function RideHistory({ token }) { const { t } = useLanguage();
const [rides, setRides] = useState([]); const [lostItems, setLostItems] = useState([]); const [loading, setLoading] = useState(true); const [offerInputs, setOfferInputs] = useState({}); const [processingRide, setProcessingRide] = useState(null);
const updateRide = (updatedRide) => { if (!updatedRide) return;
setRides((currentRides) =>
  currentRides.map((ride) =>
    ride._id === updatedRide._id ? updatedRide : ride
  )
);
};
const fetchRides = async () => { try { const res = await fetch( 'http://localhost:5000/api/rides', { headers: { Authorization: Bearer ${token}, }, } );
  const data = await res.json();

  if (res.ok) {
    setRides(data);
  } else {
    console.error('Ride history error:', data);
  }
} catch (err) {
  console.error('Ride history fetch error:', err);
} finally {
  setLoading(false);
}
};
const fetchLostItems = async () => { try { const res = await fetch( 'http://localhost:5000/api/lost-items/my', { headers: { Authorization: Bearer ${token}, }, } );
  const data = await res.json();

  if (res.ok) {
    setLostItems(data);
  } else {
    console.error('Lost items error:', data);
  }
} catch (err) {
  console.error('Lost items fetch error:', err);
}
};
const cancelRide = async (rideId) => { try { const res = await fetch( http://localhost:5000/api/rides/${rideId}/cancel, { method: 'POST', headers: { Authorization: Bearer ${token}, }, } );
  const data = await res.json();

  if (!res.ok) {
    alert(data.error || 'Failed to cancel ride');
    return;
  }

  updateRide(data);
} catch (err) {
  console.error('Cancel ride error:', err);
  alert(t('serverError'));
}
};
const makeOffer = async (rideId) => { const offerAmount = offerInputs[rideId];
if (
  offerAmount === undefined ||
  offerAmount === '' ||
  !Number.isFinite(Number(offerAmount)) ||
  Number(offerAmount) <= 0
) {
  alert('يرجى إدخال سعر صحيح');
  return;
}

try {
  setProcessingRide(rideId);

  const res = await fetch(
    `http://localhost:5000/api/rides/${rideId}/offer`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Bearer ${token},
      },
      body: JSON.stringify({
        offerAmount: Number(offerAmount),
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || 'فشل إرسال العرض');
    return;
  }

  updateRide(data.ride);
  setOfferInputs((current) => ({
    ...current,
    [rideId]: '',
  }));

  alert(data.message || 'تم إرسال عرضك');
} catch (err) {
  console.error('Make offer error:', err);
  alert(t('serverError'));
} finally {
  setProcessingRide(null);
}
};
const agreeFare = async (rideId) => { try { setProcessingRide(rideId);
  const res = await fetch(
   dRide : ride
  )
);
};
const fetchRides = async () => { 
    {
      method: 'POST',
      headers: {
        Authorization: Bearer ${token},
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || 'فشل قبول السعر');
    return;
  }

  updateRide(data.ride);
  alert(data.message || 'تم الاتفاق على السعر');
} catch (err) {
  console.error('Agree fare error:', err);
  alert(t('serverError'));
} finally {
  setProcessingRide(null);
}
};
const reportLostItem = async (rideId) => { const description = window.prompt( t('describeLostItem') );
if (!description || !description.trim()) return;

try {
  const response = await fetch(
    'http://localhost:5000/api/lost-items',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Bearer ${token},
      },
      body: JSON.stringify({
        rideId,
        description: description.trim(),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.message || t('reportFailed'));
    return;
  }

  setLostItems((current) => [...current, data.lostItem]);

  alert(t('reportedSuccessfully'));
} catch (error) {
alert(t('serverError'));
}
};
useEffect(() => { if (!token) return;
fetchRides();
fetchLostItems();

const interval = setInterval(() => {
  fetchRides();
}, 5000);

return () => clearInterval(interval);
}, [token]);
if (loading) return <p>{t('loadingRides')}</p>;
return ( <div dir="auto"> <h2>{t('myRides')}</h2>
  {rides.length === 0 && <p>{t('noRides')}</p>}

  {rides.map((ride) => {
    const lostItem = lostItems.find((item) => {
      const reportedRideId =
        typeof item.ride === 'object'
          ? item.ride?._id
          : item.ride;

      return String(reportedRideId) === String(ride._id);
    });

    const isProcessing = processingRide === ride._id;

    return (
      <div
        key={ride._id}
        style={{
          border: '1px solid #ddd',
          margin: 8,
          padding: 12,
          borderRadius: 6,
        }}
      >
        <p>
          <b>{t('pickup')}:</b> {ride.pickup}
        </p>

        <p>
          <b>{t('dropoff')}:</b> {ride.dropoff}
        </p>

        <p>
          وقت الحجز:{' '}
          {new Date(ride.createdAt).toLocaleString('ar-LY')}
        </p>

        <p>
          <b>{t('status')}:</b>{' '}
          {ride.status === 'completed'
            ? t('completed')
            : ride.status === 'requested'
            ? t('requested')
            : ride.status === 'accepted'
            ? t('accepted')
            : ride.status === 'cancelled'
            ? t('cancelled')
            : ride.status}
        </p>

        {/* Fare information */}
        <div
          style={{
            marginTop: 12,
            padding: 10,
            background: '#f5f5f5',
            borderRadius: 6,
          }}
        >
          <h4>تفاصيل السعر</h4>

          {ride.originalFare != null ? (
            <>
              <p>
                السعر الأصلي: {ride.originalFare} د.ل
              </p>

              <p>
                أقل سعر مقبول: {ride.minimumFare} د.ل
              </p>

              {ride.driverOffer != null && (
                <p>
                  عرض السائق: {ride.driverOffer} د.ل
                </p>
              )}

              {ride.riderOffer != null && (
                <p>
                  عرضك: {ride.riderOffer} د.ل
                </p>
              )}

              {ride.fareAgreed ? (
                <p>
                  <b>
                    السعر النهائي المتفق عليه: {ride.finalFare} د.ل
                  </b>
                </p>
              ) : ride.status === 'requested' ? (
                <>
                  {ride.lastOfferBy === 'driver' && (
                    <div>
                      <p>السائق قدم عرضاً جديداً. يمكنك قبوله أو تقديم عرض مقابل.</p>

                      <button
                        onClick={() => agreeFare(ride._id)}
                        disabled={isProcessing}
                      >
                        قبول عرض السائق
                      </button>
                    </div>
                  )}

                  {ride.lastOfferBy === 'rider' && (
                    <p>تم إرسال عرضك. في انتظار رد السائق.</p>
                  )}

                  {!ride.lastOfferBy && (
                    <p>في انتظار عرض السائق الأول.</p>
                  )}

                  {ride.lastOfferBy === 'driver' && (
                    <div style={{ marginTop: 10 }}>
                      <input
                        type="number"
                        min={ride.minimumFare}
                        step="any"
                        placeholder="اكتبي السعر المقترح"
                        value={offerInputs[ride._id] || ''}
                        onChange={(e) =>
                          setOfferInputs((current) => ({
                            ...current,
                            [ride._id]: e.target.value,
                          }))
                        }
                      />

                      <button
                        onClick={() => makeOffer(ride._id)}
                        disabled={isProcessing}
                      >
                        إرسال عرض مقابل
</button>
                    </div>
                  )}
                </>
              ) : null}
            </>
          ) : (
            <p>سيظهر السعر بعد حساب مسافة الرحلة.</p>
          )}
        </div>

        {ride.status === 'completed' && !lostItem && (
          <button onClick={() => reportLostItem(ride._id)}>
            {t('reportLostItem')}
          </button>
        )}

        {lostItem && (
          <div
            style={{
              marginTop: 12,
              padding: 10,
              background: '#f5f5f5',
              borderRadius: 6,
            }}
          >
            <h4>{t('lostItemReports')}</h4>

            <p>
              <b>{t('description')}:</b> {lostItem.description}
            </p>

            <p>
              <b>{t('status')}:</b>{' '}
              {lostItem.status === 'found'
                ? t('found')
                : lostItem.status === 'not_found'
                ? t('notFound')
                : lostItem.status === 'resolved'
                ? t('resolved')
                : lostItem.status === 'under_review'
                ? t('underReview')
                : t('reported')}
            </p>

            {lostItem.driverReply ? (
              <div>
                <p>
                  <b>{t('driverReply')}:</b>
                </p>
                <p>{lostItem.driverReply}</p>
              </div>
            ) : (
              <p>{t('waitingReply')}</p>
            )}
          </div>
        )}

        {ride.status === 'requested' && (
          <button onClick={() => cancelRide(ride._id)}>
            {t('cancelRide')}
          </button>
        )}
      </div>
    );
  })}
</div>
); }
                        
                                          
