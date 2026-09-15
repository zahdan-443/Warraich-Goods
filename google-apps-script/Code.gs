/**
 * Google Apps Script Web App for Bilty Verification & Load Tracker
 * 
 * Instructions:
 * 1. Open your Google Sheet ("Warraich Goods Transport" / Load Tracker).
 * 2. Go to Extensions > Apps Script.
 * 3. Replace or add this code in Code.gs.
 * 4. Click Deploy > New deployment.
 * 5. Select type: "Web app".
 * 6. Execute as: "Me" (your Google account).
 * 7. Who has access: "Anyone" (so consignors, drivers, receivers can verify bilties via QR code without logging in).
 * 8. Copy the generated Web App URL and set it in your app if you want direct Apps Script hosting,
 *    or the app's internal verification screen will seamlessly verify loaded Bilties.
 */

function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};
  var page = params.page || '';
  var biltyNo = params.bilty || params.biltyNo || params.id || '';

  // Format or sanitize bilty parameter
  biltyNo = biltyNo.toString().trim();

  if (page === 'verify' || biltyNo) {
    return handleBiltyVerification(biltyNo);
  }

  // Default JSON status response for health checks or API querying
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    app: 'Warraich Goods Bilty Verification Engine',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleBiltyVerification(biltyNo) {
  if (!biltyNo) {
    return HtmlService.createHtmlOutput(renderNotFoundHtml('No Bilty Number provided.'))
      .setTitle('Bilty Verification | Warraich Goods')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    // Try tabs: "Load Tracker", "Bilties", or the first active sheet
    var sheet = ss.getSheetByName('Load Tracker') || ss.getSheetByName('Bilties') || ss.getSheets()[0];
    
    if (!sheet) {
      return HtmlService.createHtmlOutput(renderNotFoundHtml('Load Tracker sheet not found in spreadsheet.'))
        .setTitle('Bilty Verification | Warraich Goods');
    }

    var data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return HtmlService.createHtmlOutput(renderNotFoundHtml('No Bilty records found in sheet.'))
        .setTitle('Bilty Verification | Warraich Goods');
    }

    var headers = data[0].map(function(h) { return h.toString().toLowerCase().trim(); });

    // Find column indexes
    var colBiltyNo = findColIndex(headers, ['bilty no', 'bilty', 'bilty number', 'bilty_no', 'bilty #']);
    var colDate = findColIndex(headers, ['date', 'bilty date', 'dispatch date']);
    var colVehicle = findColIndex(headers, ['vehicle no', 'vehicle', 'truck no', 'vehicle_no']);
    var colDriver = findColIndex(headers, ['driver name', 'driver', 'driver_name']);
    var colDriverMobile = findColIndex(headers, ['driver mobile', 'mobile', 'mobile no', 'driver_mobile']);
    var colSendingCity = findColIndex(headers, ['sending city', 'origin', 'from', 'from city']);
    var colReceivingCity = findColIndex(headers, ['receiving city', 'destination', 'to', 'to city']);
    var colSenderName = findColIndex(headers, ['sender name', 'consignor', 'sender']);
    var colSenderMobile = findColIndex(headers, ['sender mobile', 'consignor phone', 'sender phone']);
    var colSenderCnic = findColIndex(headers, ['sender cnic', 'cnic', 'consignor cnic']);
    var colReceiverName = findColIndex(headers, ['receiver name', 'consignee', 'receiver']);
    var colReceiverMobile = findColIndex(headers, ['receiver mobile', 'consignee phone', 'receiver phone']);
    var colQty = findColIndex(headers, ['qty', 'quantity', 'nag', 'carton']);
    var colDesc = findColIndex(headers, ['item description', 'description', 'goods', 'cargo']);
    var colWeight = findColIndex(headers, ['weight', 'kg', 'mann']);
    var colTotal = findColIndex(headers, ['total', 'grand total', 'freight', 'total freight']);
    var colAdvance = findColIndex(headers, ['advance', 'advance freight', 'advance paid']);
    var colPayable = findColIndex(headers, ['payable', 'balance', 'balance payable']);

    var targetNormalized = normalizeBiltyNo(biltyNo);
    var foundRecord = null;

    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      var cellBilty = (colBiltyNo !== -1 ? row[colBiltyNo] : row[0]).toString().trim();
      if (normalizeBiltyNo(cellBilty) === targetNormalized) {
        foundRecord = {
          biltyNo: cellBilty,
          date: formatDate(colDate !== -1 ? row[colDate] : ''),
          vehicleNo: sanitize(colVehicle !== -1 ? row[colVehicle] : ''),
          driverName: sanitize(colDriver !== -1 ? row[colDriver] : ''),
          driverMobile: sanitizePhone(colDriverMobile !== -1 ? row[colDriverMobile] : ''),
          sendingCity: sanitize(colSendingCity !== -1 ? row[colSendingCity] : ''),
          receivingCity: sanitize(colReceivingCity !== -1 ? row[colReceivingCity] : ''),
          senderName: sanitize(colSenderName !== -1 ? row[colSenderName] : ''),
          senderMobile: sanitizePhone(colSenderMobile !== -1 ? row[colSenderMobile] : ''),
          senderCnic: sanitizePhone(colSenderCnic !== -1 ? row[colSenderCnic] : ''),
          receiverName: sanitize(colReceiverName !== -1 ? row[colReceiverName] : ''),
          receiverMobile: sanitizePhone(colReceiverMobile !== -1 ? row[colReceiverMobile] : ''),
          qty: sanitize(colQty !== -1 ? row[colQty] : ''),
          itemDescription: sanitize(colDesc !== -1 ? row[colDesc] : 'General Cargo'),
          weight: sanitize(colWeight !== -1 ? row[colWeight] : ''),
          total: parseAmount(colTotal !== -1 ? row[colTotal] : 0),
          advance: parseAmount(colAdvance !== -1 ? row[colAdvance] : 0),
          payable: parseAmount(colPayable !== -1 ? row[colPayable] : 0)
        };
        break;
      }
    }

    if (!foundRecord) {
      return HtmlService.createHtmlOutput(renderNotFoundHtml('Bilty No "' + escapeHtml(biltyNo) + '" was not found in Load Tracker.'))
        .setTitle('Bilty Not Found | Warraich Goods');
    }

    return HtmlService.createHtmlOutput(renderVerifiedHtml(foundRecord))
      .setTitle('Verified Bilty #' + foundRecord.biltyNo + ' | Warraich Goods')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  } catch (err) {
    return HtmlService.createHtmlOutput(renderNotFoundHtml('Error checking Bilty: ' + err.toString()))
      .setTitle('Verification Error');
  }
}

function findColIndex(headers, variations) {
  for (var i = 0; i < variations.length; i++) {
    var v = variations[i].toLowerCase();
    for (var h = 0; h < headers.length; h++) {
      if (headers[h] === v || headers[h].indexOf(v) !== -1) {
        return h;
      }
    }
  }
  return -1;
}

function normalizeBiltyNo(val) {
  return (val || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function sanitize(val) {
  if (val === null || val === undefined) return '';
  return val.toString().trim();
}

function sanitizePhone(val) {
  var s = sanitize(val);
  if (!s || /^0+$/.test(s.replace(/[-+\s]/g, '')) || s === '0' || s === '0000') {
    return 'N/A';
  }
  return s;
}

function parseAmount(val) {
  if (typeof val === 'number') return val;
  var cleaned = (val || '').toString().replace(/[^0-9.-]+/g, '');
  var num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || 'GMT+5', 'yyyy-MM-dd');
  }
  return val.toString().trim();
}

function escapeHtml(str) {
  return (str || '')
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderVerifiedHtml(b) {
  var formattedTotal = b.total.toLocaleString();
  var formattedAdvance = b.advance.toLocaleString();
  var formattedPayable = b.payable.toLocaleString();

  return '<!DOCTYPE html>' +
  '<html lang="ur" dir="rtl">' +
  '<head>' +
  '  <meta charset="UTF-8">' +
  '  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
  '  <title>تصدیق شدہ بلٹی | ورائچ گڈز ٹرانسپورٹ کمپنی</title>' +
  '  <style>' +
  '    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }' +
  '    body { background: #fdfbf7; color: #2d3a24; padding: 16px; display: flex; justify-content: center; }' +
  '    .container { width: 100%; max-width: 600px; background: #ffffff; border: 1px solid #ecece0; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; }' +
  '    .banner { background: #ecfdf5; border-bottom: 2px solid #10b981; padding: 16px 20px; text-align: center; }' +
  '    .badge { display: inline-block; background: #059669; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.5px; }' +
  '    .banner h2 { font-size: 18px; color: #065f46; margin-top: 8px; font-weight: 800; }' +
  '    .banner p { font-size: 12px; color: #047857; margin-top: 4px; }' +
  '    .header { padding: 20px; border-bottom: 1px solid #ecece0; display: flex; justify-content: space-between; align-items: center; }' +
  '    .header h1 { font-size: 18px; color: #4a5e38; font-weight: 800; }' +
  '    .header .bilty-tag { background: rgba(74,94,56,0.1); color: #4a5e38; font-size: 15px; font-weight: 800; padding: 6px 14px; border-radius: 12px; font-family: monospace; }' +
  '    .content { padding: 20px; }' +
  '    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }' +
  '    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }' +
  '    .card { background: #fdfbf7; border: 1px solid #ecece0; border-radius: 16px; padding: 12px; }' +
  '    .card-label { font-size: 11px; color: #8e8e75; font-weight: 700; margin-bottom: 4px; display: block; }' +
  '    .card-value { font-size: 13px; font-weight: 700; color: #333333; }' +
  '    .party-title { font-size: 11px; font-weight: 800; color: #4a5e38; text-transform: uppercase; margin-bottom: 6px; }' +
  '    .party-name { font-size: 14px; font-weight: 800; color: #1f2937; margin-bottom: 4px; }' +
  '    .party-meta { font-size: 12px; color: #6b7280; line-height: 1.6; }' +
  '    .finance-box { background: rgba(74,94,56,0.05); border: 1px solid rgba(74,94,56,0.2); border-radius: 16px; padding: 14px; margin-bottom: 16px; }' +
  '    .finance-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; }' +
  '    .finance-row.total { border-top: 1px solid rgba(74,94,56,0.2); margin-top: 6px; padding-top: 8px; font-size: 15px; font-weight: 800; color: #4a5e38; }' +
  '    .footer { padding: 16px 20px; background: #fafaf7; border-top: 1px solid #ecece0; text-align: center; font-size: 11px; color: #8e8e75; }' +
  '  </style>' +
  '</head>' +
  '<body>' +
  '  <div class="container">' +
  '    <div class="banner">' +
  '      <span class="badge">آفیشل تصدیق شدہ بلٹی - VERIFIED</span>' +
  '      <h2>ورائچ گڈز ٹرانسپورٹ کمپنی</h2>' +
  '      <p>یہ بلٹی سسٹم کے لوڈ ٹریکر میں باقاعدہ رجسٹرڈ ہے</p>' +
  '    </div>' +
  '    <div class="header">' +
  '      <div>' +
  '        <h1>بلٹی تصدیق پورٹل</h1>' +
  '        <div style="font-size:12px;color:#8e8e75;margin-top:2px;">Warraich Goods Transport Co.</div>' +
  '      </div>' +
  '      <div class="bilty-tag">' + escapeHtml(b.biltyNo) + '</div>' +
  '    </div>' +
  '    <div class="content">' +
  '      <div class="grid-3">' +
  '        <div class="card"><span class="card-label">تاریخ بلٹی</span><div class="card-value">' + escapeHtml(b.date || '-') + '</div></div>' +
  '        <div class="card"><span class="card-label">گاڑی نمبر</span><div class="card-value" style="font-family:monospace;">' + escapeHtml(b.vehicleNo || '-') + '</div></div>' +
  '        <div class="card"><span class="card-label">روٹ</span><div class="card-value">' + escapeHtml(b.sendingCity) + ' تا ' + escapeHtml(b.receivingCity) + '</div></div>' +
  '      </div>' +
  '      <div class="grid-2">' +
  '        <div class="card">' +
  '          <div class="party-title">بھیجنے والا (Consignor)</div>' +
  '          <div class="party-name">' + escapeHtml(b.senderName || 'N/A') + '</div>' +
  '          <div class="party-meta">' +
  '            <div>فون: ' + escapeHtml(b.senderMobile) + '</div>' +
  '            <div>شناختی کارڈ: ' + escapeHtml(b.senderCnic) + '</div>' +
  '          </div>' +
  '        </div>' +
  '        <div class="card">' +
  '          <div class="party-title">وصول کنندہ (Consignee)</div>' +
  '          <div class="party-name">' + escapeHtml(b.receiverName || 'N/A') + '</div>' +
  '          <div class="party-meta">' +
  '            <div>فون: ' + escapeHtml(b.receiverMobile) + '</div>' +
  '            <div>شہر: ' + escapeHtml(b.receivingCity || '-') + '</div>' +
  '          </div>' +
  '        </div>' +
  '      </div>' +
  '      <div class="card" style="margin-bottom: 16px;">' +
  '        <span class="card-label">سامان و کھیپ کی تفصیلات</span>' +
  '        <div style="font-weight:700;font-size:14px;margin-bottom:8px;">' + escapeHtml(b.itemDescription) + '</div>' +
  '        <div class="grid-2" style="margin-bottom:0;">' +
  '          <div><span class="card-label">تعداد نگ</span><span class="card-value">' + escapeHtml(b.qty || '-') + '</span></div>' +
  '          <div><span class="card-label">وزن</span><span class="card-value">' + escapeHtml(b.weight || '-') + '</span></div>' +
  '        </div>' +
  '      </div>' +
  '      <div class="finance-box">' +
  '        <div class="finance-row"><span>کل کرایہ (Grand Total):</span><b>Rs ' + formattedTotal + '</b></div>' +
  '        <div class="finance-row" style="color:#047857;"><span>پیشگی ادا شدہ (Advance):</span><b>Rs ' + formattedAdvance + '</b></div>' +
  '        <div class="finance-row total"><span>بقایا واجب الادا (Payable):</span><span>Rs ' + formattedPayable + '</span></div>' +
  '      </div>' +
  '    </div>' +
  '    <div class="footer">' +
  '      ڈرائیور دوست / ورائچ گڈز ٹرانسپورٹ سسٹم • خودکار ڈیجیٹل تصدیق' +
  '    </div>' +
  '  </div>' +
  '</body>' +
  '</html>';
}

function renderNotFoundHtml(msg) {
  return '<!DOCTYPE html>' +
  '<html lang="ur" dir="rtl">' +
  '<head>' +
  '  <meta charset="UTF-8">' +
  '  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
  '  <title>بلٹی تصدیق نہیں ہو سکی</title>' +
  '  <style>' +
  '    body { background: #fdfbf7; font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }' +
  '    .box { background: white; border: 1px solid #ecece0; border-radius: 20px; padding: 30px; text-align: center; max-width: 450px; }' +
  '    h2 { color: #dc2626; margin-bottom: 10px; }' +
  '    p { color: #6b7280; font-size: 14px; margin-bottom: 20px; }' +
  '  </style>' +
  '</head>' +
  '<body>' +
  '  <div class="box">' +
  '    <h2>⚠️ بلٹی ریکارڈ نہیں ملا</h2>' +
  '    <p>' + escapeHtml(msg) + '</p>' +
  '    <div style="font-size:12px;color:#8e8e75;">براہ کرم بلٹی نمبر درست درج کریں یا آفس سے رابطہ کریں۔</div>' +
  '  </div>' +
  '</body>' +
  '</html>';
}
