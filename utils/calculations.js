const { addMonths, daysDifference } = require('./helpers');

/**
 * Calcular los valores de un préstamo
 * @param {number} monto_solicitado - Monto que solicita el cliente
 * @param {number} numero_cuotas - Cantidad de cuotas
 * @param {number} tasa_interes - Tasa de interés mensual (%)
 * @param {Date} fecha_desembolso - Fecha de desembolso
 * @returns {object} - Objeto con todos los cálculos
 */
const calcularPrestamo = (monto_solicitado, numero_cuotas, tasa_interes, fecha_desembolso) => {
    // Convertir tasa de porcentaje a decimal
    const tasa = tasa_interes / 100;
    
    // Calcular interés mensual
    const interes_mensual = monto_solicitado * tasa;
    
    // Calcular interés total
    const interes_total = interes_mensual * numero_cuotas;
    
    // Calcular monto total a pagar
    const monto_total = monto_solicitado + interes_total;
    
    // Calcular valor de cada cuota
    const monto_cuota = monto_total / numero_cuotas;
    
    // Calcular fecha del primer pago (30 días después del desembolso)
    const fecha_primer_pago = addMonths(new Date(fecha_desembolso), 1);
    
    return {
        monto_solicitado: parseFloat(monto_solicitado.toFixed(2)),
        interes_mensual: parseFloat(interes_mensual.toFixed(2)),
        interes_total: parseFloat(interes_total.toFixed(2)),
        monto_total: parseFloat(monto_total.toFixed(2)),
        monto_cuota: parseFloat(monto_cuota.toFixed(2)),
        monto_restante: parseFloat(monto_total.toFixed(2)),
        fecha_primer_pago: fecha_primer_pago,
        fecha_proximo_pago: fecha_primer_pago
    };
};

/**
 * Calcular mora de un préstamo
 * @param {number} monto_cuota - Valor de la cuota
 * @param {number} tasa_mora - Tasa de mora mensual (%)
 * @param {number} dias_atraso - Días de atraso
 * @returns {number} - Monto de mora
 */
const calcularMora = (monto_cuota, tasa_mora, dias_atraso) => {
    if (dias_atraso <= 0) return 0;
    
    // Convertir tasa de porcentaje a decimal
    const tasa = tasa_mora / 100;
    
    // Calcular mora proporcional a los días
    const mora = monto_cuota * tasa * (dias_atraso / 30);
    
    return parseFloat(mora.toFixed(2));
};

/**
 * Calcular días de atraso
 * @param {Date} fecha_vencimiento - Fecha en que debía pagar
 * @param {Date} fecha_actual - Fecha actual (o fecha de pago)
 * @returns {number} - Días de atraso
 */
const calcularDiasAtraso = (fecha_vencimiento, fecha_actual = new Date()) => {
    const dias = daysDifference(new Date(fecha_vencimiento), fecha_actual);
    return fecha_actual > new Date(fecha_vencimiento) ? dias : 0;
};

/**
 * Calcular distribución de un pago de préstamo
 * @param {number} monto_cuota - Valor de la cuota
 * @param {number} monto_restante - Saldo restante del préstamo
 * @param {number} numero_cuotas - Total de cuotas
 * @param {number} cuotas_pagadas - Cuotas ya pagadas
 * @returns {object} - Distribución del pago
 */
const calcularDistribucionPago = (monto_cuota, monto_restante, numero_cuotas, cuotas_pagadas) => {
    const cuotas_restantes = numero_cuotas - cuotas_pagadas;
    
    // Calcular cuánto es capital y cuánto es interés
    const monto_capital = monto_restante / cuotas_restantes;
    const monto_interes = monto_cuota - monto_capital;
    
    return {
        monto_capital: parseFloat(monto_capital.toFixed(2)),
        monto_interes: parseFloat(monto_interes.toFixed(2))
    };
};

/**
 * Calcular próxima fecha de pago
 * @param {Date} fecha_ultimo_pago - Última fecha de pago
 * @returns {Date} - Próxima fecha de pago (1 mes después)
 */
const calcularProximaFechaPago = (fecha_ultimo_pago) => {
    return addMonths(new Date(fecha_ultimo_pago), 1);
};

module.exports = {
    calcularPrestamo,
    calcularMora,
    calcularDiasAtraso,
    calcularDistribucionPago,
    calcularProximaFechaPago
};