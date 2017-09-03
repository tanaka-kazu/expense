(function() {
    "use strict";

    var accountCodes = {
        "広告宣伝費":"6113",
        "新聞図書費":"6114",
        "発送配達費":"6115",
        "旅費交通費":"6133",
        "諸会費":"6134",
        "事務用消耗品費":"6217",
        "電話等通信費":"6218",
        "租税公課":"6221",
        "備品・消耗品費":"6225",
        "交通費":"6133",
        "雑費":"5467",
        "地代家賃":"6215",
        "水道光熱費":"6219",
        "機械・装置":"1213",
        "会議費":"6111",
        "交際費":"6223",
        "交際費(5000円以下)":"6112",
        "支払手数料":"6232",
        "厚生費":"6226",
        "外注費":"6212",
        "ｺﾐｯｼｮﾝ料":"5214",
        "SaaS代":"6331",
        "郵便代":"6332",
        "工具・器具・備品":"1216",
        "ﾘｰｽ料":"6334",
        "預り金":"2117",
        "支払報酬":"6235",
        "研修費":"6660",
        "仮払金":"1156",
        "雑収入":"7118",
        "保険料":"6224",
        "立替金":"1155",
        "ｿﾌﾄｳｪｱ(ﾉｰﾘﾂ)":"1240",
        "(10万以上) 工具・器具":"1216",
        "イベント費":"6115",
    };
    var genka = {
        "外注費":"6212",
        "広告宣伝費":"6113",
        "ｺﾐｯｼｮﾝ料":"5214",
        "SaaS代":"6331",
        "仕入外注費":"6332"
    };
    var deposits = {
        "預り金":"2117",
        "仮払金":"1156"
    };
    var payers = {
        "倉貫":"1",
        "藤原":"2",
        "小口現金":"",
        "":""
    }
    var csvTarget = ['未対応の一覧', '出力用一覧（当月&出力済除外）'];

    var isCsvDownloadEnabled = function(listName) {
        return -1 < csvTarget.indexOf(listName);
    }

    var isDeposit = function(record) {
        return record['expense_type'].value in deposit;
    }

    var isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    var escapeStr = function(value) {
        if(isArray(value)) {
            value = value.join(',');
        }
        return '"' + (value? value.replace(/"/g, '""'): '') + '"';
    }

    var updateCsvFlg = function(recordNo) {
        var url = 'https://asterisk.cybozu.com/k/v1/record.json';
        var body = {
            "app": 16,
            "id": recordNo,
            "record": {
                "output_csv_flg": {
                    "value": ["済"]
                }
            },
            "__REQUEST_TOKEN__": kintone.getRequestToken()
        };
        var xhr = new XMLHttpRequest();
        xhr.open('PUT', url);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                // success
                console.log(JSON.parse(xhr.responseText));
            } else {
                // error
                console.log(JSON.parse(xhr.responseText));
            }
        };
        xhr.send(JSON.stringify(body));
    }

    kintone.events.on('app.record.index.show', function(event) {

        if(!isCsvDownloadEnabled(event.viewName)) {
            return;
        }
    
        if (document.getElementById('dl_csv_button') !== null) {
            return;
        }
        
        var dlCsvButton = document.createElement('button');
        dlCsvButton.id = 'dl_csv_button';
        dlCsvButton.innerHTML = 'CSVダウンロード';

        dlCsvButton.onclick = function() {

            var records = event.records;
            if(!window.confirm('CSVをダウンロードします')) {
                return;
            }
        
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
                updateCsvFlg(record['レコード番号'].value);
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