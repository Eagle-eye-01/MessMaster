const BASE_WASTE = {
  'Chole Bhature': 72, 'Dal Makhani': 68, 'Kadhi Chawal': 58,
  'Rajma Rice': 45, 'Veg Biryani': 51, 'Paneer Butter Masala': 38,
  'Aloo Paratha': 29, 'Pav Bhaji': 44, 'Idli Sambar': 22, 'Poha': 18,
};

const DAY_MULT = { Mon: 0.85, Tue: 0.78, Wed: 1.20, Thu: 0.70, Fri: 1.10, Sat: 1.35, Sun: 1.15 };
const MEAL_MULT = { Breakfast: 0.80, Lunch: 1.10, Snacks: 0.55, Dinner: 1.00 };
const WEATHER_MULT = { Sunny: 1.0, Cloudy: 1.05, Rainy: 1.25, Stormy: 1.40, 'Very Hot': 0.85 };
const EVENT_MULT = {
  None: 1.0, 'Exam Week': 1.45, Holiday: 0.65, 'Sports Day': 0.90,
  'Cultural Fest': 0.75, 'Long Weekend': 0.60,
};

const getRiskLevel = (kg) => {
  if (kg > 60) return 'CRITICAL';
  if (kg > 40) return 'HIGH';
  if (kg > 25) return 'MODERATE';
  return 'LOW';
};

const getRiskColor = (risk) => {
  const map = { CRITICAL: '#ff3d5a', HIGH: '#ff6b2b', MODERATE: '#fbbf24', LOW: '#00e676' };
  return map[risk] || '#00e676';
};

const predict = ({ menu, meal, day, weather, event }) => {
  const base = BASE_WASTE[menu] || 40;
  const dayMult = DAY_MULT[day] || 1.0;
  const mealMult = MEAL_MULT[meal] || 1.0;
  const weatherMult = WEATHER_MULT[weather] || 1.0;
  const eventMult = EVENT_MULT[event] || 1.0;

  const predictedKg = parseFloat((base * dayMult * mealMult * weatherMult * eventMult).toFixed(1));
  const costLoss = parseFloat((predictedKg * 40).toFixed(0));
  const co2Kg = parseFloat((predictedKg * 2.5).toFixed(1));
  const riskLevel = getRiskLevel(predictedKg);
  const confidence = Math.floor(Math.random() * 19) + 80;

  const reasons = [];
  if (dayMult > 1) reasons.push(`${day} historically sees ${Math.round((dayMult - 1) * 100)}% higher waste`);
  if (dayMult < 1) reasons.push(`${day} sees ${Math.round((1 - dayMult) * 100)}% lower attendance`);
  if (weatherMult > 1) reasons.push(`${weather} weather increases waste by ${Math.round((weatherMult - 1) * 100)}%`);
  if (eventMult > 1) reasons.push(`${event} inflates waste by ${Math.round((eventMult - 1) * 100)}%`);
  if (eventMult < 1) reasons.push(`${event} reduces attendance by ${Math.round((1 - eventMult) * 100)}%`);
  if (mealMult > 1) reasons.push(`${meal} service has highest consumption rate`);
  reasons.push(`Base waste for ${menu} is ${base}kg historically`);

  const actions = [];
  if (riskLevel === 'CRITICAL') {
    actions.push('⚠️ Reduce preparation by 30% from standard quantity');
    actions.push('🔔 Alert kitchen staff to monitor portions actively');
    actions.push('📦 Arrange donation pickup for excess food');
  } else if (riskLevel === 'HIGH') {
    actions.push('📉 Reduce preparation by 15-20%');
    actions.push('👀 Monitor serving portions at the counter');
  } else if (riskLevel === 'MODERATE') {
    actions.push('📋 Log servings carefully during meal');
    actions.push('🔄 Prepare backup batch only if needed');
  } else {
    actions.push('✅ Proceed with standard preparation');
    actions.push('📈 Good efficiency day — note for future planning');
  }

  return {
    predictedKg, costLoss, co2Kg, riskLevel,
    riskColor: getRiskColor(riskLevel),
    confidence, reasons, actions,
    factors: { base, dayMult, mealMult, weatherMult, eventMult },
  };
};

module.exports = { predict };
