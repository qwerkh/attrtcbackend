import {checkInModel} from "../model/checkIn_model.js";
import {userModel} from "../model/user_model.js";
import moment from "moment";

export const checkIn = async (req, res) => {
    const {userId,latitude,longitude} = req.body;
    const userDoc = await userModel.findById(userId);
    if (!userDoc) {
        return res.status(400).json({error: "Invalid user",message: "Invalid user"});
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
        const newCheckIn = new checkInModel({
            userId: userId,
            name: userDoc.name,
            date: date,
            time: time,
            type: typeCheckIn,
        });
        const id = await newCheckIn.save();

        return res.status(200).json({
            code: "201",
            message: id
        })
    }
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