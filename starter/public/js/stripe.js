/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51SYb7ID3AlBEDttQba7YL0s6ZzcMPsKPOdfdLmOJfdsEv4ItYwqEuGBr8oRHqOR2I5x4W8Z2BGcv1tnotksabhWX00Bw4nHAqu',
);

export const bookTour = async (tourId) => {
  try {
    // 1) NÃO PRECISA ESPECIFICAR METHOD , POIS É GET, APENAS COLOCAMOS A URL. TAMBÉM NÃO TEMOS DADOS ESPECIFICOS AQUI
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`,
    );


    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.error(err);
    showAlert('error', err);
  }
};
