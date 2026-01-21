import {checkInModel} from "../model/checkIn_model.js";
import {userModel} from "../model/user_model.js";
import moment from "moment";

export const checkIn = async (req, res) => {
    const {userId, latitude, longitude} = req.body;
    const userDoc = await userModel.findById(userId);
    if (!userDoc) {
        return res.status(400).json({error: "Invalid user", message: "Invalid user"});
    } else {

        const distance = getDistanceFromLatLonInMeters(
            process.env.OFFICE_LAT,
            process.env.OFFICE_LNG,
            latitude,
            longitude
        );
        if (distance > process.env.ALLOWED_RADIUS) {
            return res.status(200).json({
                code: "402",
                message: "លោកអ្នកនៅឆ្ងាយពីកន្លែងធ្វើការពេក រហូតដល់ទៅ" + Math.round(distance) + "m"
            });
        }

        const date = moment().format('YYYY-MM-DD');
        const time = moment().format('HH:mm A');
        const typeCheckIn = time < "10:00" ? "MorningIn" : time < "12:10" ? "MorningOut" : time < "15:40" ? "AfternoonIn" : "AfternoonOut";

        const user = await checkInModel.findOne({userId: userId, type: typeCheckIn, date: date});
        if (user) {
            return res.status(200).json({
                code: "401",
                message: "Already Checked In/Out",
            })
        }
        let late = 0;
        if (typeCheckIn === "MorningIn") {
            if (moment().format('dddd') == "Monday") {
                late = -(moment().diff(moment().hour(7).minute(0).second(0), "minutes"))
            } else {
                late = -(moment().diff(moment().hour(7).minute(30).second(0), "minutes"))
            }
        } else if (typeCheckIn === "MorningOut") {
            if (moment().format('dddd') == "Monday") {
                late = (moment().diff(moment().hour(11).minute(0).second(0), "minutes"))
            } else {
                late = (moment().diff(moment().hour(11).minute(30).second(0), "minutes"))
            }
        } else if (typeCheckIn === "AfternoonIn") {
            late = -(moment().diff(moment().hour(13).minute(0).second(0), "minutes"))
        } else {
            late = (moment().diff(moment().hour(17).minute(0).second(0), "minutes"))
        }
        if (late > 0) {
            late = 0;
        }
        const newCheckIn = new checkInModel({
            userId: userId,
            name: userDoc.name,
            date: date,
            time: time,
            type: typeCheckIn,
            latitude: latitude,
            longitude: longitude,
            distance: distance,
            late: late
        });
        const id = await newCheckIn.save();

        return res.status(200).json({
            code: "201",
            message: id
        })
    }
}

export const checkInByDay = async (req, res) => {
    let {datestart, dateend, page, limit} = req.body;
    page = parseInt(page) || 1
    limit = parseInt(limit) || 10
    const skip = (page - 1) * limit
    const [dataList, total] = await Promise.all([
        checkInModel.aggregate([
            {$match: {date: {$gte: datestart, $lte: dateend}}},
            {$sort: {createdAt: 1}},
            {
                $group: {
                    _id: {
                        userId: "$userId",
                        date: "$date",
                    },
                    name: {$last: "$name"},
                    MorningIn: {
                        $max: {
                            $cond: [
                                {$eq: ["$type", "MorningIn"]},
                                "$late",
                                null
                            ]
                        }
                    },
                    AfternoonIn: {
                        $max: {
                            $cond: [
                                {$eq: ["$type", "AfternoonIn"]},
                                "$late",
                                null
                            ]
                        }
                    },
                    MorningOut: {
                        $max: {
                            $cond: [
                                {$eq: ["$type", "MorningOut"]},
                                "$late",
                                null
                            ]
                        }
                    },
                    AfternoonOut: {
                        $max: {
                            $cond: [
                                {$eq: ["$type", "AfternoonOut"]},
                                "$late",
                                null
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$_id.userId",
                    name: "$name",
                    date: "$_id.date",
                    MorningIn: 1,
                    AfternoonIn: 1,
                    MorningOut: 1,
                    AfternoonOut: 1
                }
            },
            {$skip: skip},
            {$limit: limit},
        ]),
        checkInModel.find({date: {$gte: datestart, $lte: dateend}}).countDocuments()

    ])

    return res.status(200).json({
        code: "201",
        data: dataList,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    })
}

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const toRad = (value) => value * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // distance in meters
}