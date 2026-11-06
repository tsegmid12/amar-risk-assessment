const BASE = process.env.BITRIX_WEBHOOK;
const valuation = "UF_CRM_1787040157"
const feePercentage = "UF_CRM_1787040525" 
async function bitrixCall(method, params) {
  const res = await fetch(`${BASE}/${method}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(10000), // 10 секундээс удвал зогсооно
  });
  const data = await res.json();
  if (data.error) throw new Error(`${data.error}: ${data.error_description}`);
  return data.result;
}
 
async function createProposalDeal(ra) {
  return bitrixCall('crm.deal.add', {
    fields: {
      TITLE: '',
      CATEGORY_ID: Number(process.env.BITRIX_SALES_BEFORE_CATEGORY_ID),
      STAGE_ID: process.env.BITRIX_EMAIL_SENT_STAGE_ID,
      COMMENTS: `Вебээс эрсдэлийн үнэлгээ илгээгдсэн (Байгууллага: ${ra.organization})`,
      ASSIGNED_BY_ID: 32655, 

    },
  });
}

async function createPriceOfferDeal(ra) {
  return bitrixCall('crm.deal.add', {
    fields: {
      TITLE: '',
      CATEGORY_ID: Number(process.env.BITRIX_SALES_BEFORE_CATEGORY_ID),
      STAGE_ID: process.env.BITRIX_EMAIL_SENT_STAGE_ID,
      COMMENTS: `Вебээс үнийн санал илгээгдсэн (Байгууллага: ${ra.organization})`,
      ASSIGNED_BY_ID: 32655,
      [valuation]: ra.priceOffers.reduce((sum, offer) => sum + offer.valuation, 0),
      [feePercentage]: ra.priceOffers.reduce((sum, offer) => sum + offer.feePercentage, 0),
    }
  })
}
 
module.exports = { bitrixCall, createProposalDeal, createPriceOfferDeal };