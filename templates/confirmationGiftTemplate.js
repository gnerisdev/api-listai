export function confirmationGiftTemplate(
  // { 
  //   clientName, 
  //   totalValue, 
  //   items, 
  // }
  data
) {
  const giftListHtml = data.items.map(item => `
    <tr>
      <td style="padding: 8px 0;">${item.gift_name}</td>
      <td style="padding: 8px 0; text-align: right;">
        ${item.quantity} x R$ ${item.unit_price.toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Presente Confirmado - Listai</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding: 20px;">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
              <tr>
                <td style="background-color: #4CAF50; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                  <h2>Seu presente foi confirmado!</h2>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <p>Olá!</p>
                  <p>
                    Passando para confirmar o seu presente!
                  </p>

                  <strong>Detalhes:</detalhes>
                  <table width="100%" style="margin-top: 20px;">
                    ${giftListHtml}
                    <tr>
                      <td colspan="2" style="border-top: 1px solid #ccc; padding-top: 10px; text-align: right;">
                        <strong>Total: R$ ${data.totalValue.toFixed(2)}</strong>
                      </td>
                    </tr>
                  </table>

                  <p style="margin-top: 30px;">Obrigado por participar!</p>
                  <p>— Listai</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 15px; text-align: center; background-color: #f0f0f0; font-size: 12px; color: #999;">
                  &copy; Listai. Todos os direitos reservados.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
