/*
 * Author: Narendra Reddy<narendrasathi457@gmail.com>
 */
/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/url'],
    function (url) {
        function fieldChanged(context) {
            // Navigate to selected page
            if (context.fieldId == 'custpage_pageid') {
                let pageId = context.currentRecord.getValue({
                    fieldId : 'custpage_pageid'
                });

                pageId = parseInt(pageId.split('_')[1]);

                let Customer = context.currentRecord.getValue({
                    fieldId : 'custpage_customer'
                });

                let Date=context.currentRecord.getText({
                    fieldId : 'custpage_date'
                });

                let Data=context.currentRecord.getValue({
                    fieldId : 'custpage_data'
                });


                let suitelet_Url= url.resolveScript({
                    scriptId : getParameterFromURL('script'),
                    deploymentId : getParameterFromURL('deploy')
                });

                if(Customer!='' && Customer!=null && Customer!=undefined)
                    suitelet_Url=suitelet_Url+'&Customer='+Customer;
                if(Date!='' && Date!=null && Date!=undefined)
                    suitelet_Url=suitelet_Url+'&Date='+Date;
                if(pageId!='' && pageId!=null && pageId!=undefined)
                    suitelet_Url=suitelet_Url+'&page='+pageId;
                if(Data!='' && Data!=null && Data!=undefined)
                    suitelet_Url=suitelet_Url+'&Data='+Data;

                window.onbeforeunload=null;
                document.location=suitelet_Url;


            }
            else if((context.fieldId == 'custpage_customer') || (context.fieldId == 'custpage_date'))
            {
                let Customer = context.currentRecord.getValue({
                    fieldId : 'custpage_customer'
                });

                let Date=context.currentRecord.getText({
                    fieldId : 'custpage_date'
                });


                let suitelet_Url= url.resolveScript({
                    scriptId : getParameterFromURL('script'),
                    deploymentId : getParameterFromURL('deploy')
                });

                if(Customer!='' && Customer!=null && Customer!=undefined)
                    suitelet_Url=suitelet_Url+'&Customer='+Customer;
                if(Date!='' && Date!=null && Date!=undefined)
                    suitelet_Url=suitelet_Url+'&Date='+Date;
                window.onbeforeunload=null;
                document.location=suitelet_Url;
            }

            // Logic to add the user selected records to a hidden field, so that records can be retrived even if the user navigates through pagination
            else if(context.fieldId == 'custpage_checkbox' && context.sublistId=='custpage_sublist') {
                var Data = context.currentRecord.getValue({fieldId: 'custpage_data'});
                var checkBox = context.currentRecord.getSublistValue({sublistId: 'custpage_sublist',fieldId: 'custpage_checkbox', line: context.line});
                //    alert('checkBox'+checkBox);
                if (checkBox==true || checkBox=='T')
                {
                    var InternalId = context.currentRecord.getSublistValue({
                        sublistId: 'custpage_sublist',
                        fieldId: 'custpage_internalid',
                        line: context.line
                    });


                    if (Data != '' && Data != null && Data != undefined) {
                        Data = Data + ',' + InternalId
                    } else {
                        Data = InternalId;
                    }
                    context.currentRecord.setValue('custpage_data', Data);
                }
                else
                {
                    var InternalId = context.currentRecord.getSublistValue({
                        sublistId: 'custpage_sublist',
                        fieldId: 'custpage_internalid',
                        line: context.line
                    });

                    Data=Data.split(',');
                    //alert('Data'+Data);

                    // remove the Id from data field if the transaction is unselected.

                    const index = Data.indexOf(InternalId);
                    if (index > -1) { // only splice array when item is found
                        Data.splice(index, 1); // 2nd parameter means remove one item only
                    }

                    context.currentRecord.setValue('custpage_data', Data.join(','));
                }
            }
        }

        function getSuiteletPage(suiteletScriptId, suiteletDeploymentId, pageId) {
            document.location = url.resolveScript({
                scriptId : suiteletScriptId,
                deploymentId : suiteletDeploymentId,
                params : {
                    'page' : pageId
                }
            });
        }

        function getParameterFromURL(param) {
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == param) {
                    return decodeURIComponent(pair[1]);
                }
            }
            return (false);
        }
        function saveRecord(context) {
            var Data = context.currentRecord.getValue({fieldId: 'custpage_data'});
            if(Data=='' || Data==null || Data==undefined) {
                alert("Please select atleast one line from the sublist below.");
                return false;
            }
            else
            {
                return true;
            }
        }
        return {
            fieldChanged : fieldChanged,
            saveRecord:saveRecord,
            getSuiteletPage : getSuiteletPage
        };

    });