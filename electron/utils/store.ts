
import Store from 'electron-store'

export const store = new Store();

const hash = store.get('hash')
// store.delete('hash')
if (!hash) {
    store.set('hash', [])
}
