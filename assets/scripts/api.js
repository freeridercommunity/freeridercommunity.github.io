Object.defineProperty(window, 'FreeRiderAPI', {
	value: new class RequestManager extends EventTarget {
		static domain = 'freeriderhd.com';
		static cdn = `https://cdn.${this.domain}/free_rider_hd/`;
		static corsAnywhereDomains = [
			'allorigins.win/raw?url=',
			'proxy.cors.sh/',
			'corsproxy.io/',
			'test.cors.workers.dev/'
		];

		_promises = new Map();
		_handleTrackRequest(data) {
			this._promises.set(data.id, data);
			this.dispatchEvent(new CustomEvent('trackLoad', { detail: data }));
		}

		async _fetch(url, options) {
			let r;
			for (const prefix of this.constructor.corsAnywhereDomains) {
				r = await fetch(`https://${prefix}${url}`, options)
					.catch(() => null);
				if (r?.status === 200) break;
			}

			if (!r)
				throw new RangeError('Failed to fetch');

			return r.json();
		}

		async track(id, { preferCDN } = {}) {
			if (!id) throw new Error('First positional argument: id must be of type number|string');
			if (!preferCDN) {
				return this._fetch(`https://www.freeriderhd.com/t/${id}?ajax`)
				// return this._fetch(`https://www.freeriderhd.com/track_api/load_track?t=${id}`)
					// .then(r => r.json())
					// .then(({ data: r }) => r);
			}

			const script = document.createElement('script');
			script.setAttribute('src', `${this.constructor.cdn}tracks/prd/${id}/track-data-v1.js?callback=t`);
			return new Promise((resolve, reject) => {
				script.addEventListener('error', reject);
				script.addEventListener('load', () => {
					script.remove();
					const data = this._promises.get(parseInt(id));
					resolve(data);
				});
				document.head.appendChild(script);
				setTimeout(() => {
					reject(new RangeError('Request timed out'));
				}, window || 3e3);
			});
		}

		async user(username) {
			if (!username) throw new Error('First positional argument: id must be of type string|number');
			return this._fetch(`https://www.freeriderhd.com/u/${username}?ajax`);
		}
	}
});

Object.defineProperty(window, 't', {
	value: FreeRiderAPI._handleTrackRequest.bind(FreeRiderAPI)
});