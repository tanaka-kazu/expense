(function() {
    "use strict";
    kintone.events.on('app.record.index.show', function(event) {

        if(!/未対応/.test(event.viewName) && !/出力用/.test(event.viewName)) {
            return;
        }

        if (document.getElementById('dl_csv_button') !== null) {
            return;
        }

        var dlCsvButton = document.createElement('button');
        dlCsvButton.id = 'dl_csv_button';
        dlCsvButton.innerHTML = 'CSVダウンロード';

        var isArray = function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }

        // エスケープ
        var escapeStr = function(value) {
            if(isArray(value)) {
                value = value.join(',');
            }
            return '"' + (value? value.replace(/"/g, '""'): '') + '"';
        };

        dlCsvButton.onclick = function() {

            var records = event.records;
            window.confirm('CSVをダウンロードします');
        
            if ((window.URL || window.webkitURL).createObjectURL == null) {
                // サポートされていないブラウザ
                return;
            }

            var csv = [];
            var row = ['ID', '税理士チェック', '税金', '氏名', '費目', '内容', '金額', '領収書', '日付', '作成日時'];
            csv.push(row);
            for (var i = 0; i < records.length; i++ ) {
                var record = records[i];
                row = [];
                row.push(escapeStr(record['レコード番号'].value));
                row.push(escapeStr(record['checked'].value));
                row.push(escapeStr(record['tax_type'].value));
                row.push(escapeStr(record['name'].value));
                row.push(escapeStr(record['expense_type'].value));
                row.push(escapeStr(record['expense_content'].value));
                row.push(escapeStr(record['expense_amount'].value));
                row.push(escapeStr(record['receipt_sheets'].value));
                row.push(escapeStr(record['expense_date'].value));
                row.push(escapeStr(record['作成日時'].value));

                csv.push(row);
            }

            // 文字列を配列に
            var str2array = function(str) {
                var array = [],i,il=str.length;
                for (i=0; i<il; i++) array.push(str.charCodeAt(i));
                return array;
            };

            // SJISの配列に変換
            var csvbuf = csv.map(function(e){return e.join(',')}).join('\r\n');
            var fileName = "download.csv";                    
            var array = str2array(csvbuf);
            var sjis_array = Encoding.convert(array, "SJIS", "UNICODE");
            var uint8_array = new Uint8Array(sjis_array);
            var blob = new Blob([uint8_array], { type: 'text/csv' });
            
            var url = (window.URL || window.webkitURL).createObjectURL(blob);

            if (window.navigator.msSaveOrOpenBlob) {
                // for IE
                window.navigator.msSaveOrOpenBlob(blob, fileName);
            } else {
                var link = document.createElement("a");
                link.download = fileName;
                link.href = url;

                document.body.appendChild(link);
                link.click();
        
                document.body.removeChild(link);
            }

        };

        kintone.app.getHeaderMenuSpaceElement().appendChild(dlCsvButton);
    });
})();