var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import moment from 'moment-timezone';
moment.locale('en');
export function formatTime(timestamp, timezoneId) {
    if (!timestamp)
        return 'N/A';
    timestamp = timestamp.setZone(timezoneId);
    return timestamp.toFormat('h:mm');
}
export function formatDate(timestamp, timezoneId) {
    if (!timestamp)
        return 'N/A';
    timestamp = timestamp.setZone(timezoneId);
    return timestamp.toFormat('EEEE, MMM d');
}
export const remindGate = (userId, message) => __awaiter(void 0, void 0, void 0, function* () {
    return fetch(`http://zmanim-remind-gate.system.dickersystems.com/message/${userId}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message,
            file: null,
            filename: null
        })
    });
});
/* tslint:disable:max-classes-per-file */
export class Zman {
    constructor(timestamp, name) {
        this.time = timestamp;
        this.name = name;
    }
    toStr(timezoneId) {
        return `${this.name}: ${formatTime(this.time, timezoneId)}`;
    }
}
export class Zmanim {
    constructor(clandar) {
        this.dawn = new Zman(clandar.getAlos16Point1Degrees(), 'Dawn');
        this.talis = new Zman(clandar.getMisheyakir11Degrees(), 'Talis');
        this.netz = new Zman(clandar.getSeaLevelSunrise(), 'Netz');
        this.shemaMga = new Zman(clandar.getSofZmanShmaMGA16Point1Degrees(), 'Shema MGA');
        this.shemaGra = new Zman(clandar.getSofZmanShmaGRA(), 'Shema GRA');
        this.shachris = new Zman(clandar.getSofZmanTfilaGRA(), 'Shachris');
        this.chatzos = new Zman(clandar.getChatzos(), 'Chatzos');
        this.minchaGedola = new Zman(clandar.getMinchaGedola(), 'Mincha');
        this.plag = new Zman(clandar.getPlagHamincha(), 'Plag');
        this.shkia = new Zman(clandar.getSeaLevelSunset(), 'Shkia');
        this.tzeis = new Zman(clandar.getTzais(), 'Tzeis');
        this._60Min = new Zman(clandar.getTzais60(), '60 Min');
        this._72Min = new Zman(clandar.getTzais72(), '72 Min');
        clandar.getDate().plus({ days: 1 });
        // Setting in israel to true being that we shoule never return a time for 2nd day yom tov
        if (clandar.isAssurBemlacha(clandar.getDate(), clandar.getTzais(), true))
            this.candleLighting = new Zman(clandar.getCandleLighting(), 'Candle Lighting');
    }
    list() {
        const a = [
            this.dawn,
            this.talis,
            this.netz,
            this.shemaMga,
            this.shemaGra,
            this.shachris,
            this.chatzos,
            this.minchaGedola,
            this.plag,
        ];
        if (this.candleLighting)
            a.push(this.candleLighting);
        const b = [
            this.shkia,
            this.tzeis,
            this._60Min,
            this._72Min
        ];
        return a.concat(b);
    }
}
//# sourceMappingURL=utils.js.map