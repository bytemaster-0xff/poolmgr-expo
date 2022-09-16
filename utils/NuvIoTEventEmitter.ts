interface Subscription {
    name: string,
    callback: (event: any) => void
}

export class NuvIoTEventEmitter {
    subscriptions: Subscription[] = [];

    emit(name: string, data: any) {
        for(let subscription of this.subscriptions ){
            if(subscription.name == name) {
                subscription.callback(data);
            }
        }
    }

    addListener(name: string, callback: (event: any) => void) {
        this.subscriptions.push({
            name: name,
            callback: callback
        });
    }

    removeAllListeners(name: string) {
        let activeSubscriptions = this.subscriptions.filter(sub=>sub.name == name);
        for(let subscription of activeSubscriptions) {
            let idx = this.subscriptions.indexOf(subscription);
            this.subscriptions.splice(idx, 1);
        }
    }
}