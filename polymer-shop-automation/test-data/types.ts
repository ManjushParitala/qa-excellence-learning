/** Shape of checkout form data used by CheckoutPage and the JSON fixtures. */
export interface CheckoutInfo {
  accountEmail: string;
  accountPhone: string;
  shipAddress: string;
  shipCity: string;
  shipState: string;
  shipZip: string;
  shipCountry?: string; // visible label in the country dropdown
  ccName: string;
  ccNumber: string;
  ccExpMonth?: string; // visible label, e.g. "12 - December"
  ccExpYear?: string;
  ccCVV: string;
}

export interface ProductData {
  category: string;
  name: string; // URL-encoded segment used in /detail/<category>/<name>
  displayName: string;
}
