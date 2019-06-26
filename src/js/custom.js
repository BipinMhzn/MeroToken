var receipt_data_arr = [0,2,3,4,5,6,10,12,13,14];

function createReceiptTable(data){
    var count = 0;
    var tbl_body = $(".receipt-table-body");
    tbl_body.empty();
    $.each(data, function(k,v){
        if(receipt_data_arr.includes(count)){
            let t_html = "<tr><th>"+k+":</th><td>"+v+"</td></tr>"
            tbl_body.append(t_html);
        }
        count++;     
    })
}

