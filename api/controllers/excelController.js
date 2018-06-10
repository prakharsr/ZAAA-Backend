var xlsx = require('excel');
var config = require('../../config');
var RateCard = require('../models/Ratecard');
var userController = require('./userController');
var User = require('../models/User');
var MediaHouse = require('../models/MediaHouse');
var Executive = require('../models/Executive');
var Client = require('../models/Client');
var XLSX = require('xlsx');
var base64 = require('base64-stream');
var stream = require('stream');

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
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log("User not found");
			response.send({
				success:false,
				msg:err
			});
		}
		else{
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
                        client.save((err) => {
                            if(err){
                                response.send({
                                    success: false,
                                    msg: 'Unsuccessful'
                                });
                            }
                        });
                    });
                    response.send({
                        success: true,
                        msg: 'Bulk upload successful'
                    });
                }
            });
        }
    });
}

module.exports.ratecardExcelImport = (request, response) => {
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log("User not found");
			response.send({
				success:false,
				msg:err
			});
		}
		else{
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
                        var ratecard = new RateCard({
                            MediaType:request.body.mediaType,
                            AdType:request.body.adType,
                            AdWords:request.body.AdWords,
                            AdWordsMax:request.body.AdWordsMax,
                            AdTime:request.body.AdTime,
                            RateCardType:request.body.rateCardType,
                            BookingCenter:request.body.bookingCenter,
                            mediahouseID:mediahouseID,
                            Category:request.body.categories,
                            Rate:request.body.rate,
                            Position:request.body.position,
                            Hue:request.body.hue,
                            MaxSizeLimit: request.body.maxSizeLimit,
                            MinSizeLimit:request.body.minSizeLimit,
                            FixSize:request.body.fixSize,
                            Scheme:request.body.scheme,
                            Premium:request.body.premium,
                            Tax:request.body.tax,
                            ValidFrom:request.body.validFrom,
                            ValidTill:request.body.validTill,
                            Covered:request.body.covered,
                            Remarks:request.body.remarks,
                            PremiumCustom:request.body.PremiumCustom,
                            PremiumBox:request.body.PremiumBox,
                            PremiumBaseColour:request.body.PremiumBaseColour,
                            PremiumCheckMark:request.body.PremiumCheckMark,
                            PremiumEmailId:request.body.PremiumEmailId,
                            PremiumWebsite:request.body.PremiumWebsite,
                            PremiumExtraWords:request.body.PremiumWebsite,
                            firm :user.firm,
                            global:false
                        });
                        ratecard.save((err) => {
                            if(err){
                                response.send({
                                    success: false,
                                    msg: 'Unsuccessful'
                                });
                            }
                        });
                    });
                    response.send({
                        success: true,
                        msg: 'Bulk upload successful'
                    });
                }
            });
        }
    });
}

module.exports.mediahouseExcelImport = (request, response) => {
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log("User not found");
			response.send({
				success:false,
				msg:err
			});
		}
		else{
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
                        var mediahouse = new MediaHouse({
                            OrganizationName:request.body.organizationName,
                            PublicationName:request.body.publicationName,
                            NickName:request.body.nickName,
                            MediaType:request.body.mediaType,
                            Language:request.body.Language,
                            Address:request.body.address,
                            OfficeLandline:request.body.officeLandline,
                            officeStdNo:request.body.officeStdNo,
                            Scheduling:request.body.scheduling,
                            global:false,
                            pullouts:request.body.pullouts,
                            GSTIN:request.body.GSTIN,
                            Remark:request.body.Remark,
                            firm : user.firm
                        });
                        mediahouse.save((err) => {
                            if(err){
                                response.send({
                                    success: false,
                                    msg: 'Unsuccessful'
                                });
                            }
                        });
                    });
                    response.send({
                        success: true,
                        msg: 'Bulk upload successful'
                    });
                }   
            });
        }
    });
}

module.exports.executiveExcelImport = (request, response) => {
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log("User not found");
			response.send({
				success:false,
				msg:err
			});
		}
		else{
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
                        var executive = new Executive({
                            OrganizationName:request.body.organizationName,
                            CompanyName:request.body.companyName,
                            ExecutiveName:request.body.executiveName,
                            Designation:request.body.designation,
                            Department:request.body.department,
                            MobileNo:request.body.mobileNo,
                            EmailId:request.body.email,
                            Photo:request.body.photo,
                            DateOfBirth:request.body.dob,
                            Anniversary:request.body.anniversary,
                            Remark:request.body.Remark,    
                            firm : user.firm 
                        });
                        executive.save((err) => {
                            if(err){
                                response.send({
                                    success: false,
                                    msg: 'Unsuccessful'
                                });
                            }
                        });
                    });
                    response.send({
                        success: true,
                        msg: 'Bulk upload successful'
                    });
                }
            });
        }
    });
}

module.exports.generateMediaHouseSheet = async function(request, response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
            MediaHouse.find({firm : user.firm}, function(err, mediahouses){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    createSheet(mediahouses, request, response,'MediaHouseExportData', 'excelExport');
                }
            });
        }	
	});

};

module.exports.generateClientSheet = async function(request, response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
            Client.find({firm : user.firm}, function(err, clients){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    createSheet(clients, request, response,'ClientExportData', 'excelExport');
                }
            });
        }	
	});

};

module.exports.generateExecutiveSheet = async function(request, response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
            Executive.find({firm : user.firm}, function(err, executives){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    createSheet(executives, request, response,'ExecutiveExportData', 'excelExport');
                }
            });
        }	
	});

};

module.exports.generateRateCardSheet = async function(request, response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
            RateCard.find({firm : user.firm}, function(err, ratecards){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    createSheet(ratecards, request, response,'RateCardExportData', 'excelExport');
                }
            });
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