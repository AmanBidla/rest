/*
 * Copyright (c) 2013 VMware, Inc. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

(function (define, global) {
	'use strict';

	define(function (require) {

		var interceptor, xdrClient, UrlBuilder, origin, hasXdr, hasXhrCors;

		interceptor = require('../../interceptor');
		xdrClient = require('../../client/xdr');
		UrlBuilder = require('../../UrlBuilder');

		origin = global.location.protocol + '//' + global.location.host + '/';
		hasXdr = 'XDomainRequest' in window;
		hasXhrCors = window.XMLHttpRequest && 'withCredentials' in new window.XMLHttpRequest();

		function isCrossOrigin(request) {
			// crude, but good enough for now
			var url = new UrlBuilder(request.path, request.params).absolute().build();
			var index = url.indexOf(origin);
			return index !== 0;
		}

		/**
		 * Apply IE 8 and 9's cross domain support if needed and available.
		 *
		 * XDR enabled cross-origin requests, but with sever restrictions. Please
		 * understand these restrictions before using this interceptor. For example:
		 * only GET and POST are supported, there is no response status code, there
		 * are no request or response headers except for the response Content-Type,
		 * the remote server must use the same scheme as the origin http-to-http
		 * https-to-https.
		 *
		 * http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
		 *
		 * If needed, this interceptor should be installed as close to the
		 * interceptor chain root as possible. When the XDR client is needed, any
		 * other interceptors in the primary chain are skipped. It is possible to
		 * mimick the primary interceptor chain, by wrapping the XDR client in the
		 * same interceptors and providing the resulting client as the 'xdrClient'
		 * config property.
		 *
		 * @param {Client} [client] client to wrap
		 * @param {Client} [config.xdrClient] the client to use when XDR is needed, defaults to 'rest/client/xdr'
		 *
		 * @returns {Client}
		 */
		return interceptor({
			request: function handleRequest(request, config) {
				if (hasXdr && !hasXhrCors && isCrossOrigin(request)) {
					return new interceptor.ComplexRequest({ request: request, client: config.xdrClient || xdrClient });
				}
				return request;
			}
		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	this
	// Boilerplate for AMD and Node
));
