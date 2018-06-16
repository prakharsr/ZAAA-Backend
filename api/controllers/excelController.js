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


module.exports.clientExcelUpdate = (request, response) => {
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
                        Client.findByIdAndUpdate(element._id,{$set: element}, (err, doc) => {
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
                        msg: 'Bulk update successful'
                    });
                }
            });
        }
    });
}

module.exports.ratecardExcelUpdate = (request, response) => {
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
                        RateCard.findByIdAndUpdate(element._id,{$set: element}, (err, doc) => {
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
                        msg: 'Bulk update successful'
                    });
                }
            });
        }
    });
}

module.exports.mediahouseExcelUpdate = (request, response) => {
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
                        MediaHouse.findByIdAndUpdate(element._id,{$set: element}, (err, doc) => {
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
                        msg: 'Bulk update successful'
                    });
                }
            });
        }
    });
}

module.exports.executiveExcelUpdate = (request, response) => {
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
                        Executive.findByIdAndUpdate(element._id,{$set: element}, (err, doc) => {
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
                        msg: 'Bulk update successful'
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
                    var mediahouses_map = mediahouses.map({

                    });
                    createSheet(mediahouses_map, request, response,'MediaHouseExportData', 'excelExport');
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
                    var clients_map = clients.map({
                        
                    });
                    createSheet(clients_map, request, response,'ClientExportData', 'excelExport');
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
                    var executives_map = executives.map({

                    });
                    createSheet(executives_map, request, response,'ExecutiveExportData', 'excelExport');
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
                    var ratecards_map = ratecards.map({

                    });
                    createSheet(ratecards_map, request, response,'RateCardExportData', 'excelExport');
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