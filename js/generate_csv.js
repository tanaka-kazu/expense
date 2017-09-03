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
    var costs = {
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

    var csvHeader = ['処理区分', 'データID', '伝票日付', '伝票番号', '入力日付', '借方・科目', '補助コード'
         ,'部門コード', '取引先コード', '取引先名', '税種別', '事業区分', '税率', '内外別記', '金額', '税額'
         ,'摘要', '貸方・科目', '補助コード', '部門コード', '取引先コード', '取引先名', '税種別', '事業区分'
         , '税率', '内外別記', '金額', '税額', '摘要'];
    
    var escapeStr = function(value) {
        if(isArray(value)) {
            value = value.join(',');
        }
        return '"' + (value? value.replace(/"/g, '""'): '') + '"';
    }

    var getPayerCode = function(payer) {
        return escapeStr(payers[payer]);
    }

    var isCsvDownloadEnabled = function(listName) {
        return -1 < csvTarget.indexOf(listName);
    }

    var isDeposit = function(record) {
        if(getPayerCode(record)) {
            return false;
        }
        return record['expense_type'].value in deposits;
    }

    var isCost = function(record) {
        return record['expense_type'].value in costs;
    }

    var isIncludeTax = function(record) {
        return record['tax_type'] == '仕課内（8%）';
    }

    var isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    var getAccountCode = function(expenseType) {
        return escapeStr(accountCodes[expenseType]);
    }

    var updateCsvFlg = function(recordNo) {
        var body = {
            "app": 16,
            "id": recordNo,
            "record": {
                "output_csv_flg": {
                    "value": ["済"]
                }
            }
        };
		kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', body, function(resp) {
    		// success
    		console.log(resp);
		}, function(error) {
    		// error
    		console.log(error);
		});
    }

    var createRowCsv = function(record) {
        var row = [];
        // 1 処理区分
        row.push(escapeStr("1"));
        // 2 データID
        row.push(escapeStr(""));
        // 3 伝票日付
        row.push(escapeStr(record['expense_date'].value));
        // 4 伝票番号
        row.push(escapeStr(""));
        // 5 入力日付
        row.push(escapeStr(""));
        //--------------------------借方
        // 6 借方・科目
        row.push(getAccountCode(record['expense_type'].value));
        // 7 補助コード
        if(record['expense_type'].value == "外注費") {
            row.push(13);
        }
        else {
            row.push(escapeStr(""));
        }
        // 8 部門コード
        row.push(escapeStr(""));
        // 9 取引先コード
        row.push(escapeStr(""));
        // 10 取引先名
        row.push(escapeStr(""));
        // 11 税種別
        if(isCost(record)) {
            row.push(50);
        } else {
            row.push(60);
        }
        // 12 事業区分
        row.push(1);
        // 13 税率
        row.push(8); // 税率8%
        // 14 内外別記（内税表記は1）
        if(isIncludeTax(record)) {
            row.push(1);
        }
        else {
            row.push(escapeStr(""));
        }
        // 15 金額
        row.push(escapeStr(record['expense_amount'].value));
        // 16 税額
        row.push(escapeStr(""));
        // 17 摘要
        row.push(escapeStr(record['expense_content'].value));
        //--------------------------貸方
        // 18 貸方・科目（小口現金の場合は1118）
        if (record['payer'].value == "小口現金"){ 
          row.push(1118);
        } else {
          row.push(2114);
        }
        // 19 補助コード
        row.push(getPayerCode(record));
        // 20 部門コード
        row.push(escapeStr(""));
        // 21 取引先コード
        row.push(escapeStr(""));
        // 22 取引先名
        row.push(escapeStr(""));
        // 23 税種別
        if(isCost(record)) {
            row.push(50);
        } else {
            row.push(60); 
        }
        // 24 事業区分
        row.push(1);
        // 25 税率
        row.push(8); // 税率8%
        // 26 内外別記
        row.push(1);
        // 27 金額
        row.push(escapeStr(record['expense_amount'].value));
        // 28 税額
        row.push(escapeStr(""));
        // 29 摘要
        row.push(escapeStr(record['expense_content'].value));

        return row;
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
            csv.push(csvHeader);
            for (var i = 0; i < records.length; i++ ) {
                var record = records[i];
                if(isDeposit(record)) {
                    continue;
                }
                csv.push(createRowCsv(record));
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