var xlsx = require('excel');
var RateCard = require('../models/Ratecard');
var MediaHouse = require('../models/MediaHouse');
var Executive = require('../models/Executive');
var Client = require('../models/Client');
var XLSX = require('xlsx');
var base64 = require('base64-stream');
var stream = require('stream');
var mongoose = require('mongoose');

function convertToJSON(array){
    var first = array[0].join();
    var headers = first.split('');
    var jsonData = [];
    for(var i = 1, length = array.length; i < length; i++){
        var Row = array[i].join();
        var row = Row.split(',');
        var data = {};
        for(var x = 0; x < row.length; x++){
            data[headers[x]] = row[x];
        }
        jsonData.push(data);
    }
    return jsonData;
}

module.exports.clientExcelImport = (request, response) => {
    var user = response.locals.user;
    var workbook = XLSX.read(request.files.excelFile.data, {type:'buffer'});
    var sheet_name_list = workbook.SheetNames;
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var count = 0; 
    var errorline = '';
    for(var i = 0; i < xlData.length; i++){
        var element = xlData[i];
        var model = convertElementToClient(user, element);
        console.log(model);
        if(element.ID){
            try{
                Client.findByIdAndUpdate(mongoose.mongo.ObjectId(element.ID),{$set: model});
            }
            catch(err){
                errorline += " ,"+ (i+1);
            }
        }
        else{
            try{
                var client = new Client(model);
                client.save();
            }
            catch(err){
                errorline += " ,"+ i+1;
            }
        }
    }   
    console.log(errorline);
    response.send({
        success: true,
        msg: 'Bulk update successful',
        errorline: "Error in updating at lines numbered"+errorline 
    });
}

module.exports.ratecardExcelImport = (request, response) => {
    var user = response.locals.user;
    var workbook = XLSX.read(request.files.excelFile.data, {type:'buffer'});
    var sheet_name_list = workbook.SheetNames;
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var count = 0; 
    var errorline = '';
    for(var i = 0; i < xlData.length; i++){
        var element = xlData[i];
        var model = convertElementToRateCard(user, element);
        console.log(model);
        if(element.ID){
            try{
                Ratecard.findByIdAndUpdate(mongoose.mongo.ObjectId(element.ID),{$set: model});
            }
            catch(err){
                errorline += " ,"+ (i+1);
            }
        }
        else{
            try{
                var ratecard = new RateCard(model);
                ratecard.save();
            }
            catch(err){
                errorline += " ,"+ i+1;
            }
        }
    }   
    console.log(errorline);
    response.send({
        success: true,
        msg: 'Bulk update successful',
        errorline: "Error in updating at lines numbered"+errorline 
    });
}

module.exports.mediahouseExcelImport = (request, response) => {
    var user = response.locals.user;
    var workbook = XLSX.read(request.files.excelFile.data, {type:'buffer'});
    var sheet_name_list = workbook.SheetNames;
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var count = 0; 
    var errorline = '';
    for(var i = 0; i < xlData.length; i++){
        var element = xlData[i];
        var model = convertElementToMediaHouse(user, element);
        console.log(model);
        if(element.ID){
            try{
                MediaHouse.findByIdAndUpdate(mongoose.mongo.ObjectId(element.ID),{$set: model});
            }
            catch(err){
                errorline += " ,"+ (i+1);
            }
        }
        else{
            try{
                var mediahouse = new MediaHouse(model);
                mediahouse.save();
            }
            catch(err){
                errorline += " ,"+ i+1;
            }
        }
    }   
    console.log(errorline);
    response.send({
        success: true,
        msg: 'Bulk update successful',
        errorline: "Error in updating at lines numbered"+errorline 
    });
}

module.exports.executiveExcelImport = (request, response) => {
    var user = response.locals.user;
    var workbook = XLSX.read(request.files.excelFile.data, {type:'buffer'});
    var sheet_name_list = workbook.SheetNames;
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var count = 0; 
    var errorline = '';
    for(var i = 0; i < xlData.length; i++){
        var element = xlData[i];
        var model = convertElementToExecutive(user, element);
        console.log(model);
        if(element.ID){
            try{
                Executive.findByIdAndUpdate(mongoose.mongo.ObjectId(element.ID),{$set: model});
            }
            catch(err){
                errorline += " ,"+ (i+1);
            }
        }
        else{
            try{
                var executive = new Executive(model);
                executive.save();
            }
            catch(err){
                errorline += " ,"+ i+1;
            }
        }
    }   
    console.log(errorline);
    response.send({
        success: true,
        msg: 'Bulk update successful',
        errorline: "Error in updating at lines numbered"+errorline 
    });
}

module.exports.generateMediaHouseSheet = async function(request, response){
	var user = response.locals.user;
    var query = { "firm": user.firm }
    
    MediaHouse.find(query, function (err, mediahouses) {
        if (err) {
            console.log(err + "");
            response.send({
                success: false,
                msg: err + ""
            });
        }
        else {
            try {
                var el = mediahouses.map(function (mediahouse){
                    var obj = {
                        "ID": ''+mediahouse._id,
                        "Publication Name": mediahouse.PublicationName ? mediahouse.PublicationName : "",
                        "Organization Name": mediahouse.OrganizationName ? mediahouse.OrganizationName : "",
                        "Nick Name": mediahouse.NickName ? mediahouse.NickName : "",
                        "Media Type": mediahouse.MediaType ? mediahouse.MediaType : "",
                        "Language": mediahouse.Language ? mediahouse.Language : "",
                        "PIN": mediahouse.Address.pincode ? mediahouse.Address.pincode : "",
                        "Edition": mediahouse.Address.edition?mediahouse.Address.edition:"",
                        "City": mediahouse.Address.city?mediahouse.Address.city:"",
                        "State": mediahouse.Address.state?mediahouse.Address.state:"",
                        "Phone": (mediahouse.OfficeLandline.std ? mediahouse.OfficeLandline.std : "") + '-' + (mediahouse.OfficeLandline.phone ? mediahouse.OfficeLandline.phone: ""),
                        "GSTIN": (mediahouse.GSTIN.GSTType === 'URD'? "URD": "RD-"+mediahouse.GSTIN.GSTNo),
                        "Remark": mediahouse.Remark
                    }
                    if(mediahouse.pullouts.length > 0)
                    {
                        for (var i = 0; i < mediahouse.pullouts.length && i < 2; ++i) {
                            var index = +i + 1
                            var pullout = mediahouse.pullouts[i];
                            obj["Pullout" + index] = pullout.Name?pullout.Name:"";
                            obj["PulloutLanguage" + index] = pullout.Language?pullout.Language:"";
                            obj["PulloutFrequency" + index] = pullout.Frequency?pullout.Frequency:"";
                            obj["PulloutRemark" + index] = pullout.Remark?pullout.Remark:"";
                        }
                    }
                    if(mediahouse.Scheduling.length > 0)
                    {
                        for (var i = 0; i < mediahouse.Scheduling.length && i < 2; ++i) {
                            var index = +i + 1
                            var scheduling = mediahouse.Scheduling[i];
                            obj["PersonName" + index] = scheduling.Name?scheduling.Name:"";
                            obj["Designation" + index] = scheduling.Designation?scheduling.Designation:"";
                            obj["Mobile" + index] = scheduling.MobileNo?scheduling.MobileNo:"";
                            obj["DeskExtension" + index] = scheduling.DeskExtension?scheduling.DeskExtension:"";
                            obj["Email" + index] = scheduling.EmailId?scheduling.EmailId:"";
                            obj["Department" + index] = scheduling.Departments[0]?scheduling.Departments[0]:"";
                        }
                    }
                    return obj;
                })
            }
            catch (err) {
                console.log(err)
            }
            createSheet(el, request, response, 'MediaHouseExportData', 'excelReport');
        }
    })
};

module.exports.generateClientSheet = async function(request, response){
	var user = response.locals.user;
    var query = { "firm": user.firm }
    
    Client.find(query, function (err, clients) {
        if (err) {
            console.log(err + "");
            response.send({
                success: false,
                msg: err + ""
            });
        }
        else {
            try {
                var el = clients.map(function (client) {
                    var obj =  {
                        "Organization Name": client.OrganizationName ? client.OrganizationName : "",
                        "Nick Name": client.NickName ? client.NickName : "",
                        "Company Name": client.CompanyName ? client.CompanyName : "",
                        "Category": client.CategoryType ? client.CategoryType : "",
                        "Sub Category": client.SubCategoryType ? client.SubCategoryType : "",
                        "PIN": client.Address.pincode ? client.Address.pincode : "",
                        "City": client.Address.city,
                        "Address": client.Address.address,
                        "State": client.Address.state,
                        "Phone": client.stdNo + '-' + client.Landline,
                        "Website": client.Website,
                        "PAN": client.PanNO,
                        "GSTIN": client.GSTIN.GSTType + '-' + (client.GSTIN.GSTNo ? client.GSTIN.GSTNo : ""),
                        "Remark": client.Remark,
                    }
                    if( client.ContactPerson !==undefined && client.ContactPerson.length> 0){
                        var index;
                        for(var i = 0; i< client.ContactPerson.length && i < 2; ++i){
                            index = i+1;
                            var contactPerson = client.ContactPerson[i];
                            obj["Person Name " + index] = contactPerson.Name?contactPerson.Name:"";
                            obj["Person Designation " + index] = contactPerson.Designation?contactPerson.Designation:"";
                            obj["Person Department " + index] = contactPerson.Department?contactPerson.Department:"";
                            obj["Person Mobile " + index] = contactPerson.MobileNo;
                            obj["Person Phone " + index] = contactPerson.stdNo + "-" + contactPerson.Landline;
                            obj["Person Email " + index] = contactPerson.EmailId;
                            obj["Person DOB " + index] = contactPerson.DateOfBirth;
                            obj["Person Anniversary " + index] = contactPerson.Anniversary;
                        }
                    }
                    return obj
                })
            }
            catch (err) {
                console.log(err)
            }
            createSheet(el, request, response, 'ClientsExportData', 'excelReport');
        }
    })
};

module.exports.generateExecutiveSheet = async function(request, response){
	var user = response.locals.user;
    var query = { "firm": user.firm }
    
    Executive.find(query, function (err, executives) {
        if (err) {
            console.log(err + "");
            response.send({
                success: false,
                msg: err + ""
            });
        }
        else {
            try {
                var el = executives.map(function (executive) {
                    return {
                        "Executive Name": executive.ExecutiveName ? executive.ExecutiveName : "",
                        "Organization Name": executive.OrganizationName ? executive.OrganizationName : "",
                        "Designation": executive.Designation ? executive.Designation : "",
                        "Department": executive.Department ? executive.Department : "",
                        "MobileNo": executive.MobileNo,
                        "Email": executive.EmailId,
                        "DOB": executive.DateOfBirth,
                        "Anniversary": executive.Anniversary,
                        "Remark": executive.Remark,
                    }
                })
            }
            catch (err) {
                console.log(err)
            }
            createSheet(el, request, response, 'ExecutiveExportData', 'excelReport');
        }
    })
};

module.exports.generateRateCardSheet = async function(request, response){
	var user = response.locals.user;
    RateCard.find({firm : user.firm}, function(err, ratecards){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +""
            });
        }
        else{
            try{
                var el = ratecards.map(function (ratecard) {
                    var categories='';
                    var catarray = [ratecard.Category.Main, ratecard.Category.SubCategory1, ratecard.Category.SubCategory2, ratecard.Category.SubCategory3, ratecard.Category.SubCategory4, ratecard.Category.SubCategory5, ratecard.Category.SubCategory6]
                    catarray.forEach(function loop(element){
                        if(loop.stop){return ;}
                        if (element) {
                            categories += '-' + element;
                        }
                        else{
                            categories += ""
                            loop.stop = true;
                        }
                    });
                    var obj =  {
                        "ID": ratecard._id,
                        "Media Type": ratecard.MediaType ? ratecard.MediaType : "",
                        "Ad Type": ratecard.AdType ? ratecard.AdType : "",
                        "Ad Words": ratecard.AdWords ? ratecard.AdWords : "",
                        "Ad Words Max": ratecard.AdWordsMax ? ratecard.AdWordsMax : "",
                        "Ad Time": ratecard.AdTime ? ratecard.AdTime : "",
                        "Ad Position": ratecard.Position ? ratecard.Position : "",
                        "Ad Hue": ratecard.Hue ? ratecard.Hue : "",
                        "Rate Card Type": ratecard.RateCardType ? ratecard.RateCardType : "",
                        "Category": categories,
                        "BookingCenter.MediaHouseName": ratecard.BookingCenter.MediaHouseName ? ratecard.BookingCenter.MediaHouseName : "",
                        "BookingCenter.Edition": ratecard.BookingCenter.Edition?ratecard.BookingCenter.Edition:'',
                        "BookingCenter.PulloutName": ratecard.BookingCenter.PulloutName? ratecard.BookingCenter.PulloutName:'',
                        "Rate": ratecard.Rate.rateQuantity,
                        "MaxSizeLimit": ratecard.MaxSizeLimit ? ratecard.MaxSizeLimit.Length+'x'+ratecard.MaxSizeLimit.Width : '',
                        "MinSizeLimit": ratecard.MinSizeLimit ? ratecard.MinSizeLimit.Length+'x'+ratecard.MinSizeLimit.Width : '', 
                        "ValidFrom": ratecard.ValidFrom ? ratecard.ValidFrom : '',
                        "ValidTill": ratecard.ValidTill ? ratecard.ValidTill : '',
                        "PremiumBox": ratecard.PremiumBox ? ratecard.PremiumBox : '',
                        "PremiumBaseColour": ratecard.PremiumBaseColour ? ratecard.PremiumBaseColour : '',
                        "PremiumCheckMark": ratecard.PremiumCheckMark ? ratecard.PremiumCheckMark : '',
                        "PremiumEmailID": ratecard.PremiumEmailId ? ratecard.PremiumEmailId : '',
                        "PremiumWebsite": ratecard.PremiumWebsite ? ratecard.PremiumWebsite : '',
                        "PremiumExtraWords": ratecard.PremiumExtraWords ? ratecard.PremiumExtraWords : '',
                        "PremiumCustomType": ratecard.PremiumCustom.PremiumType ? ratecard.PremiumCustom.PremiumType : '',
                        "PremiumCustomAmount": ratecard.PremiumCustom.Amount ? ratecard.PremiumCustom.Amount : ''
                    }
                    if( ratecard.FixSize !== undefined && ratecard.FixSize.length> 0){
                        var index;
                        for(var i = 0; i< ratecard.FixSize.length && i < 2; ++i){
                            index = i+1;
                            var FixSize = ratecard.FixSize[i];
                            obj["Fix Size " + index] = FixSize.Length+'x'+FixSize.Width;
                            obj["Fix Size " + index + " Amount"] = FixSize.Amount;
                        }
                    }
                    if( ratecard.Scheme !== undefined && ratecard.Scheme.length> 0){
                        var index;
                        for(var i = 0; i< ratecard.Scheme.length && i < 2; ++i){
                            index = i+1;
                            var Scheme = ratecard.Scheme[i];
                            obj["Scheme " + index] = Scheme.paid+'-'+Scheme.Free;
                            obj["Scheme "+ index + " Timelimit"] = Scheme.TimeLimit;
                        }
                    }
                    if( ratecard.Remarks !== undefined && ratecard.Remarks.length> 0){
                        var index;
                        for(var i = 0; i< ratecard.Remarks.length && i < 2; ++i){
                            index = i+1;
                            var Remarks = ratecard.Remarks[i];
                            obj["Remarks " + index] = Remarks.remark;
                        }
                    }
                    if( ratecard.Covered !== undefined && ratecard.Covered.length> 0){
                        var index;
                        for(var i = 0; i< ratecard.Covered.length && i < 2; ++i){
                            index = i+1;
                            var Covered = ratecard.Covered[i];
                            obj["Covered " + index] = Covered.mediaHouse+'-'+Covered.EditionArea;
                        }
                    }
                    if( ratecard.Tax !== undefined && ratecard.Tax.length> 0){
                        var index;
                        for(var i = 0; i< ratecard.Tax.length && i < 2; ++i){
                            index = i+1;
                            var Tax = ratecard.Tax[i];
                            obj["Tax " + index] = Tax.TaxRate +''+(Tax.Included?'%(included)':'%(excluded)');
                        }
                    }
                    return obj
                })
            }
            catch(err){
                console.log(err)
            }
            createSheet(el, request, response,'RateCardExportData', 'excelExport');
        }
    });
};

async function createSheet(data, request, response, title, subject){
    console.log(data)
    var wb = XLSX.utils.book_new();
    
    wb.Props = {
        Title: title,
        Subject: subject,
        Author: "AAMAN",
        CreatedDate: new Date(2017,12,19)
    };
    
    var ws = XLSX.utils.json_to_sheet(data);
    
    XLSX.utils.book_append_sheet(wb, ws, "MONTHLY SHEET");
    
    var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'base64'});
    
    response.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename='+title+".xlsx"
    });
    
    var decoder = base64.decode();
    var xlStream = new stream.PassThrough();
    xlStream.pipe(decoder)
    .pipe(response);
    
    xlStream.write(wbout);
    
    response.end();
}


function convertElementToMediaHouse(user, element) {
    var pullouts = [];
    var scheduling = [];
    for(var i = 1; element["Pullout"+i]; i++){
        pullouts.push({
            "Name": element["Pullout"+i],
            "Language": element["PulloutLanguage"+i],
            "Frequency": element["PulloutFrequency"+i],
            "Remark": element["PulloutRemark"+i]
        });
    }
    for(var i = 1; element["PersonName"+i]; i++){
        scheduling.push({
            "Name": element["PersonName" + i],
            "Designation": element["Designation" + i],
            "MobileNo": element["Mobile" + i],
            "DeskExtension": element["DeskExtension" + i],
            "EmailId": element["Email" + i],
            "Department": element["Department" +i]
        })
    }

    var phono, std;
    var gsttype = '', gstno = '';
    var phone = element['Phone'].split('-');
    var gstin = element['GSTIN'].split('-');

    if(phone.length === 0) {
        std = '',
        phono = ''
    }
    else if(phone.length === 1){
        std = '',
        phono = phone[0]
    }
    else if(phone.length === 2){
        std = phone[0],
        phono = phone[1]
    }

    if(gstin.length === 1){
        gsttype = 'URD';
    }
    if(gstin.length === 2){
        gsttype = 'RD';
        gstno = gstin[1];
    }



    var result = {
        OrganizationName:element["Organization Name"],
        PublicationName:element["Publication Name"],
        NickName:element["Nick Name"],
        MediaType:element["Media Type"],
        Language:element.Language?element.Language:'',
        Address:{
            pincode: element["PIN"],
            edition: element["Edition"],
            city: element["City"],
            state: element["State"]
        },
        OfficeLandline: {
            std:std,
            phone: phono,
        },
        Scheduling:scheduling,
        global:false,
        pullouts:pullouts,
        GSTIN:{
            GSTType : gsttype,
            GSTNo : gstno
        },
        Remark:element.Remark,
        firm : user.firm
    };
    return result;
}

function convertElementToExecutive(user, element) {
    var result = {
        ExecutiveName:element["Executive Name"],
        OrganizationName:element["Organization Name"],
        Designation:element["Designation"],
        Department:element["Department"],
        MobileNo:element["MobileNo"],
        EmailId:element["Email"],
        DateOfBirth:element["DOB"],
        Anniversary:element["Anniversary"],
        Remark:element["Remark"],    
        firm : user.firm 
    };
    return result;
}

function convertElementToClient(user, element) {

    var contactPerson = [];
    for(var i = 1; element["Person Name "+i]; i++){
        var stdn, phonn;
        var phonb = element['Person Phone '+i].split('-');
        if(phonb.length === 0) {
            stdn = '',
            phonn = ''
        }
        else if(phonb.length === 1){
            stdn = '',
            phonn = phone[0]
        }
        else if(phonb.length === 2){
            stdn = phone[0],
            phonn = phone[1]
        }
        contactPerson.push({
            "Name": element["Person Name "+i],
            "Designation": element["Person Designation "+i],
            "Department": element["Person Department "+i],
            "MobileNo": element["Person Mobile "+i],
            "stdNo": stdn,
            "Landline": phonn,
            "EmailId": element["Person Email "+i],
            "DateOfBirth": element["Person DOB "+i],
            "Anniversary": element["Person Annivarsary "+i]
        });
    }

    var phono, std;
    var gsttype = '', gstno = '';
    var phone = element['Phone'].split('-');
    var gstin = element['GSTIN'].split('-');

    if(phone.length === 0) {
        std = '',
        phono = ''
    }
    else if(phone.length === 1){
        std = '',
        phono = phone[0]
    }
    else if(phone.length === 2){
        std = phone[0],
        phono = phone[1]
    }

    if(gstin.length === 1){
        gsttype = 'URD';
    }
    if(gstin.length === 2){
        gsttype = 'RD';
        gstno = gstin[1];
    }


    var result = {
        OrganizationName:element["Organization Name"],
        NickName:element["Nick Name"],
        CompanyName:element["Company Name"],
        CategoryType:element["Category"],
        SubCategoryType:element["Sub Category"],
        Address:{
            address: element["Address"],
            city: element["City"],
            state: element["State"],
            pincode: element["PIN"]
        },
        stdNo:std,
        Landline:phono,
        Website:element["Website"],
        PanNO:element["PAN"],
        GSTIN:{
            GSTType : gsttype,
            GSTNo : gstno
        },
        ContactPerson:contactPerson,
        Remark:element["Remark"],
        firm : user.firm
    };
    return result;
}

async function convertElementToRateCard(user, element) {
    var FixSize = [];
    var Scheme = [];
    var Remarks = [];
    var Tax = [];
    var Covered = [];
    for(var i = 1; element["Fix Size "+i]; i++){
        FixSize.push({
            "Length": element["Fix Size "+i].split('x')[0],
            "Width": element["Fix Size "+i].split('x')[1],
            "Amount": element["Fix Size "+i+" Amount"]
        })
    }
    for(var i = 1; element["Scheme "+i]; i++){
        Scheme.push({
            "paid": element["Scheme "+i].split('-')[0],
            "Free": element["Scheme "+i].split('-')[1],
            "TimeLimit": element["Scheme "+i+" Timelimit"]
        })
    }
    for(var i = 1; element["Remarks "+i]; i++){
        Remarks.push({
            "remark": element["Remarks "+i]
        })
    }
    for(var i = 1; element["Covered "+i]; i++){
        Covered.push({
            "mediaHouse": element["Covered "+i].split('-')[0],
            "EditionArea": element["Covered "+i].split('-')[1]
        })
    }
    for(var i = 1; element["Tax "+i]; i++){
        Tax.push({
            "TaxRate": element["Tax "+i].split('%')[0],
            "Included": (element["Tax "+i].split('%')[1] === '(included)' ? true : false)
        })
    }
    

    var mediahouseID =  await getMediahouseID(request,response,user);
    var bookingCenter = {
        MediaHouseName: element["BookingCenter.MediaHouseName"],
        Edition: element["BookingCenter.Edition"],
        PulloutName: element["BookingCenter.PulloutName"]
    };
    var rate = {
        rateQuantity: element["Rate"],
        unit: '',
        unitQuantity: ''
    };
    var result ={
        MediaType:element["Media Type"],
        AdType:element["Ad Type"],
        AdWords:element["Ad Words"],
        AdWordsMax:element["Ad Words Max"],
        AdTime:element["Ad Time"],
        Position:element["Ad Position"],
        Hue:element["Ad Hue"],
        RateCardType:element["Rate Card Type"],
        BookingCenter: bookingCenter,
        mediahouseID:mediahouseID,
        Rate:rate,
        MaxSizeLimit:{
            "Length" : element[MaxSizeLimit] !== '' ? element[MaxSizeLimit].split('x')[0] : '' ,
            "Width" : element[MaxSizeLimit] !== '' ? element[MaxSizeLimit].split('x')[1] : ''
        } ,
        MinSizeLimit:{
            "Length" : element[MinSizeLimit] !== '' ? element[MinSizeLimit].split('x')[0] : '' ,
            "Width" : element[MinSizeLimit] !== '' ? element[MinSizeLimit].split('x')[1] : ''
        } ,
        ValidFrom:element.ValidFrom,
        ValidTill:element.ValidTill, 
        PremiumCustom:element.PremiumCustom,
        PremiumBox:element.PremiumBox,
        PremiumBaseColour:element.PremiumBaseColour,
        PremiumCheckMark:element.PremiumCheckMark,
        PremiumEmailId:element.PremiumEmailId,
        PremiumWebsite:element.PremiumWebsite,
        PremiumExtraWords:element.PremiumWebsite,
        FixSize: FixSize,
        Scheme: Scheme,
        Remarks: Remarks,
        Covered: Covered,
        Tax: Tax,
        firm :user.firm,
        global:false
    };
    return result;
}

function getMediahouseID(request, response, user){
    return new Promise((resolve, reject) => {
        MediaHouse.find({$and: [
            {PublicationName:request.body.bookingCenter.MediaHouseName},
            {"Address.edition":request.body.bookingCenter.Edition}
        ]}).exec( function(err, mediahouse){
            if(err)
            {
                console.log(err);
                reject(err);
                return;
            }
            else if (mediahouse.length == 0)
            {
                console.log('no mediahouse found');
                var newMediahouse = new MediaHouse({
                    OrganizationName:request.body.organizationName,
                    PublicationName:request.body.publicationName,
                    Address:request.body.address,
                    global:false,
                    GSTIN:request.body.GSTIN,
                    firm : user.firm
                });
                
                newMediahouse.save(function(err, doc){
                    console.log('mediahouse saved');
                    mediahouseID = newMediahouse._id;
                    resolve(mediahouseID)
                })
            }
            if(mediahouse.length!==0){
                console.log("mediahouse found");
                console.log(mediahouse)
                mediahouseID =  mediahouse[0]._id;
                resolve(mediahouseID)
            }
        });
    })
}
