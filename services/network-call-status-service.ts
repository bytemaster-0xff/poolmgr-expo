
import { BehaviorSubject,  Observable } from 'rxjs';
import { NuvIoTEventEmitter } from '../utils/NuvIoTEventEmitter';


export class NetworkCallStatusService {

    public emitter: NuvIoTEventEmitter = new NuvIoTEventEmitter();

    constructor() { }
    _activeCallCount: number = 0;
    private _loadingMessages: String[] = [];
    protected _activeCalls = new BehaviorSubject<String[]>(this._loadingMessages);
    protected _endCalls = new BehaviorSubject<String[]>(this._loadingMessages);

    onCallBegin(): Observable<String[]> {
        return this._activeCalls.asObservable();
    }

    onCallEnd(): Observable<String[]> {
        return this._endCalls.asObservable();
    }

    beginCall() {
        this._activeCallCount++;
        this._loadingMessages.push("loading");
        this._activeCalls.next(this._loadingMessages);

        console.log(this._activeCallCount);
        this.emitter.emit('busy', this._activeCallCount);
    }

    endCall() {
        this._activeCallCount--;
        this._loadingMessages.pop();
        if (this._activeCallCount == 0) {
            this._endCalls.next(this._loadingMessages);
            this.emitter.emit('idle', this._activeCallCount);
        }

        console.log(this._activeCallCount);
    }
}
