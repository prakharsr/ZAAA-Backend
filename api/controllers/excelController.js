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
    var errorstring = '';
    xlData.forEach(element => {
        count++;
        var contactPerson = [];
        for(var i = 1; ; i++){
            if(object["Person Name "+i] !== null){
                contactPerson.push({
                    "Name": object["Person Name "+i],
                    "Designation": object["Person Designation "+i],
                    "Department": object["Person Department "+i],
                    "MobileNo": object["Person Mobile "+i],
                    "stdNo": object["Person Phone "+i].split("-")[0],
                    "Landline": object["Person Phone "+i].split("-")[1],
                    "EmailId": object["Person Email "+i],
                    "DateOfBirth": object["Person DOB "+i],
                    "Anniversary": object["Person Anniversary "+i],
                });
            }
        }
        var client = new Client({
             OrganizationName:element.organizationName,
            CompanyName:element.companyName,
            NickName:element.nickName,
            CategoryType:element.categoryType,
            SubCategoryType:element.SubCategoryType,
            IncorporationDate:element.IncorporationDate,
            Address:element.address,
            stdNo:element.stdNo,
            Landline:element.landline,
            Website:element.website,
            PanNO:element.panNo,
            GSTIN:element.GSTIN,
            ContactPerson:element.contactPerson,
            Remark:element.Remark,
            firm : user.firm
        });
            client.save(function(err){
                if(err){
                    errorstring += 'error at line number '+ count+' '+err;
                }
            });
           
    });
    console.log(errorstring)
    if(errorstring === '') errorstring = 'Bulk upload successful';
    response.send({
        success: true,
        msg: errorstring
    });
}

module.exports.ratecardExcelImport = (request, response) => {
    var user = response.locals.user;
    var workbook = XLSX.read(request.files.excelFile.data, {type:'buffer'});
    var sheet_name_list = workbook.SheetNames;
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var count = 0;
    var errorstring = '';
    xlData.forEach(element => {
        count++;
        var ratecard = new RateCard({
            MediaType:element.mediaType,
            AdType:element.adType,
            AdWords:element.AdWords,
            AdWordsMax:element.AdWordsMax,
            AdTime:element.AdTime,
            RateCardType:element.rateCardType,
            BookingCenter:element.bookingCenter,
            mediahouseID:mediahouseID,
            Category:element.categories,
            Rate:element.rate,
            Position:element.position,
            Hue:element.hue,
            MaxSizeLimit: element.maxSizeLimit,
            MinSizeLimit:element.minSizeLimit,
            FixSize:element.fixSize,
            Scheme:element.scheme,
            Premium:element.premium,
            Tax:element.tax,
            ValidFrom:element.validFrom,
            ValidTill:element.validTill,
            Covered:element.covered,
            Remarks:element.remarks,
            PremiumCustom:element.PremiumCustom,
            PremiumBox:element.PremiumBox,
            PremiumBaseColour:element.PremiumBaseColour,
            PremiumCheckMark:element.PremiumCheckMark,
            PremiumEmailId:element.PremiumEmailId,
            PremiumWebsite:element.PremiumWebsite,
            PremiumExtraWords:element.PremiumWebsite,
            firm :user.firm,
            global:false
        });
            ratecard.save(function(err){
                if(err){
                    errorstring += 'error at line number '+ count+' '+err;
                }
            });
           
    });
        console.log(errorstring)
        if(errorstring === '') errorstring = 'Bulk upload successful';
        response.send({
            success: true,
            msg: errorstring
        });
}

module.exports.mediahouseExcel = (request, response) => {
    var user = response.locals.user;
    var workbook = XLSX.read(request.files.excelFile.data, {type:'buffer'});
    var sheet_name_list = workbook.SheetNames;
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var count = 0;
    var errorstring = '';
    xlData.forEach(element => {
        count++;
            var mediahouse = new MediaHouse({
                OrganizationName:element.organizationName,
                PublicationName:element.publicationName,
                NickName:element.nickName,
                MediaType:element.mediaType,
                Language:element.Language,
                Address:element.address,
                OfficeLandline:element.officeLandline,
                officeStdNo:element.officeStdNo,
                Scheduling:element.scheduling,
                global:false,
                pullouts:element.pullouts,
                GSTIN:element.GSTIN,
                Remark:element.Remark,
                firm : user.firm
            });
            mediahouse.save(function(err){
                if(err){
                    errorstring += 'error at line number '+ count+' '+err;
                }
            });
           
    });
        console.log(errorstring)
        if(errorstring === '') errorstring = 'Bulk upload successful';
        response.send({
            success: true,
            msg: errorstring
        });
}

module.exports.executiveExcelImport = (request, response) => {
    var user = response.locals.user;
    var workbook = XLSX.read(request.files.excelFile.data, {type:'buffer'});
    var sheet_name_list = workbook.SheetNames;
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var count = 0;
    var errorstring = '';
    xlData.forEach(element => {
        count++;
        var executive = new Executive({
            OrganizationName:element.organizationName,
            CompanyName:element.companyName,
            ExecutiveName:element.executiveName,
            Designation:element.designation,
            Department:element.department,
            MobileNo:element.mobileNo,
            EmailId:element.email,
            Photo:element.photo,
            DateOfBirth:element.dob,
            Anniversary:element.anniversary,
            Remark:element.Remark,    
            firm : user.firm 
        });
            executive.save(function(err){
                if(err){
                    errorstring += 'error at line number '+ count+' '+err;
                }
            });
           
    });
        console.log(errorstring)
        if(errorstring === '') errorstring = 'Bulk upload successful';
        response.send({
            success: true,
            msg: errorstring
        });
}

module.exports.clientExcelUpdate = (request, response) => {
    var user = response.locals.user;
    xlsx(request.files.excelFile, function(err, data){
        if(err){
            response.send({
                success: false,
                msg: 'Unsuccessful'
            });
        }
        else{
            var json = convertToJSON(data);
            json.forEach(element => {
            try{
                Client.findByIdAndUpdate(element._id,{$set: element});
            }
            catch(err){
                response.send({
                    success: false,
                    msg: 'Unsuccessful'
                });
            }
            });
            response.send({
                success: true,
                msg: 'Bulk update successful'
            });
        }
    });
}

module.exports.ratecardExcelUpdate = (request, response) => {
    var user = response.locals.user;
    xlsx(request.files.excelFile, function(err, data){
        if(err){
            response.send({
                success: false,
                msg: 'Unsuccessful'
            });
        }
        else{
            var json = convertToJSON(data);
            json.forEach(element => {
            try{
                RateCard.findByIdAndUpdate(element._id,{$set: element});
            }
            catch(err){
                response.send({
                    success: false,
                    msg : 'Unsuccessful'
                });
            }
            });
            response.send({
                success: true,
                msg: 'Bulk update successful'
            });
        }
    });
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

module.exports.executiveExcelUpdate = (request, response) => {
    var user = response.locals.user;
    xlsx(request.files.excelFile, function(err, data){
        if(err){
            response.send({
                success: false,
                msg: 'Unsuccessful'
            });
        }
        else{
            var json = convertToJSON(data);
            json.forEach(element => {
            try{
                Executive.findByIdAndUpdate(element._id,{$set: element});
            }
            catch(err){
                response.send({
                    success: false,
                    msg: 'Unsuccessful'
                });
            }
            });
            response.send({
                success: true,
                msg: 'Bulk update successful'
            });
        }
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
