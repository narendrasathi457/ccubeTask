/*
 * Author: Narendra Reddy<narendrasathi457@gmail.com>
 */
/**
 * @NApiVersion 2.1
 */
define([ 'N/search'],
    /**
     * @param{search} search
     */
    (search) => {

        const getTransactionGroupByDueDate=(Customer,Data)=> {
            let vendorpaymentSearchObj = search.create({
                type: "invoice",
                filters:
                    [
                        ["type", "anyof", "CustInvc"],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["name", "anyof", Customer],
                        "AND",
                        ["internalid", "anyof", Data]
                    ],
                columns:
                    [
                        search.createColumn({name: "trandate", label: "Date"}),
                        search.createColumn({name: "duedate", label: "Due Date/Receive By"}),
                        search.createColumn({name: "tranid", label: "Document Number"}),
                        search.createColumn({name: "amount", label: "Amount"}),
                        search.createColumn({name: "entity", label: "Name"}),
                        search.createColumn({name: "internalid", label: "Name"})
                    ]
            });
            let retrivedResults = getMoreThan1000Results(vendorpaymentSearchObj);
            let resultJson = {};

            // looping to group through the due date of transaction

            for (let i = 0; i < retrivedResults.length; i++) {
                let dueDate = retrivedResults[i].getValue('trandate');
                if (resultJson.hasOwnProperty(dueDate)) {
                    (resultJson[dueDate]).push(retrivedResults[i].getValue('internalid'))
                } else {
                    let tempArray = [];
                    tempArray.push(retrivedResults[i].getValue('internalid'))
                    resultJson[dueDate] = tempArray;
                }
            }
            return resultJson;
        }
        const getMoreThan1000Results=(searchObj)=>
        {
            let resultSet = searchObj.run(),i=0,totalResults=[];
            do{
                var results = resultSet.getRange({start: i, end: i+1000});
                results.forEach(function (slice) {totalResults.push(slice);i++ });
            }while(results.length>=1000)
            return totalResults;
        }

        const getFileId=(FileName)=>
        {
            let fileSearchObj = search.create({type: "file",filters:[["name","is",FileName]], columns:[ "internalid"]});
            let fileResults=fileSearchObj.run().getRange(0,1);
            return fileResults[0].getValue('internalid');
        }


        const runSearch=( searchPageSize,CUSTOMER,DATE_VAL)=> {
            let searchObj = search.create({
                type: "vendorpayment",
                filters:
                    [
                        ["type","anyof","VendPymt"],
                        "AND",
                        ["mainline","is","T"],
                         "AND",
                        ["duedate","after","today"]
                    ],
                columns:
                    [
                        search.createColumn({name: "trandate", label: "Date"}),
                        search.createColumn({name: "duedate", label: "Due Date/Receive By"}),
                        search.createColumn({name: "tranid", label: "Document Number"}),
                        search.createColumn({name: "amount", label: "Amount"}),
                        search.createColumn({name: "entity", label: "Name"}),
                        search.createColumn({name: "internalid", label: "Name"})
                    ]
            });

            if(validateResult(CUSTOMER))
                searchObj.filters.push(search.createFilter({ name: 'name',operator: search.Operator.ANYOF,values: CUSTOMER }));
            if(validateResult(DATE_VAL))
                searchObj.filters.push(search.createFilter({ name: 'trandate', operator: search.Operator.ON,values: DATE_VAL}))

            //log.debug('searchObj',searchObj.filters);
            return searchObj.runPaged({pageSize : searchPageSize});
        }

        const fetchSearchResult=(pagedData, pageIndex)=>{
            let searchPage = pagedData.fetch({index : pageIndex});
            let results = [];
            searchPage.data.forEach(function (result) {
                const internalId = result.id;
                const tranid = result.getValue({name: 'tranid'});
                const amount = result.getValue({name: 'amount'});
                const trandate = result.getValue({name: 'trandate'});
                const duedate = result.getValue({name: 'duedate'});
                const entity = result.getValue({name: 'entity'});
                results.push({
                    "id" : internalId,
                    "amount" : amount,
                    "trandate":trandate,
                    "duedate":duedate,
                    "tranid":tranid,
                    "entity":entity
                });
            });
            return results;
        }

        // function to check for data validation
        const validateResult=(res)=>
        {
            if(res!='' && res!=null && res!=undefined)
                return true
            else
                return false
        }
        return {getFileId,validateResult,runSearch,fetchSearchResult,getTransactionGroupByDueDate}
    });