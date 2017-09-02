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

        dlCsvButton.onclick = function() {
            window.confirm('CSVをダウンロードします');
        };

        kintone.app.getHeaderMenuSpaceElement().appendChild(dlCsvButton);
    });
})();