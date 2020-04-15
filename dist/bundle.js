(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("ecstatic", [], factory);
	else if(typeof exports === 'object')
		exports["ecstatic"] = factory();
	else
		root["ecstatic"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	function hotDisposeChunk(chunkId) {
/******/ 		delete installedChunks[chunkId];
/******/ 	}
/******/ 	var parentHotUpdateCallback = window["webpackHotUpdateecstatic"];
/******/ 	window["webpackHotUpdateecstatic"] = // eslint-disable-next-line no-unused-vars
/******/ 	function webpackHotUpdateCallback(chunkId, moreModules) {
/******/ 		hotAddUpdateChunk(chunkId, moreModules);
/******/ 		if (parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/ 	} ;
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotDownloadUpdateChunk(chunkId) {
/******/ 		var script = document.createElement("script");
/******/ 		script.charset = "utf-8";
/******/ 		script.src = __webpack_require__.p + "hot/hot-update.js";
/******/ 		if (null) script.crossOrigin = null;
/******/ 		document.head.appendChild(script);
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotDownloadManifest(requestTimeout) {
/******/ 		requestTimeout = requestTimeout || 10000;
/******/ 		return new Promise(function(resolve, reject) {
/******/ 			if (typeof XMLHttpRequest === "undefined") {
/******/ 				return reject(new Error("No browser support"));
/******/ 			}
/******/ 			try {
/******/ 				var request = new XMLHttpRequest();
/******/ 				var requestPath = __webpack_require__.p + "hot/hot-update.json";
/******/ 				request.open("GET", requestPath, true);
/******/ 				request.timeout = requestTimeout;
/******/ 				request.send(null);
/******/ 			} catch (err) {
/******/ 				return reject(err);
/******/ 			}
/******/ 			request.onreadystatechange = function() {
/******/ 				if (request.readyState !== 4) return;
/******/ 				if (request.status === 0) {
/******/ 					// timeout
/******/ 					reject(
/******/ 						new Error("Manifest request to " + requestPath + " timed out.")
/******/ 					);
/******/ 				} else if (request.status === 404) {
/******/ 					// no update available
/******/ 					resolve();
/******/ 				} else if (request.status !== 200 && request.status !== 304) {
/******/ 					// other failure
/******/ 					reject(new Error("Manifest request to " + requestPath + " failed."));
/******/ 				} else {
/******/ 					// success
/******/ 					try {
/******/ 						var update = JSON.parse(request.responseText);
/******/ 					} catch (e) {
/******/ 						reject(e);
/******/ 						return;
/******/ 					}
/******/ 					resolve(update);
/******/ 				}
/******/ 			};
/******/ 		});
/******/ 	}
/******/
/******/ 	var hotApplyOnUpdate = true;
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentHash = "274f86b592bea4b6e16d";
/******/ 	var hotRequestTimeout = 10000;
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentChildModule;
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentParents = [];
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentParentsTemp = [];
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateRequire(moduleId) {
/******/ 		var me = installedModules[moduleId];
/******/ 		if (!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if (me.hot.active) {
/******/ 				if (installedModules[request]) {
/******/ 					if (installedModules[request].parents.indexOf(moduleId) === -1) {
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 					}
/******/ 				} else {
/******/ 					hotCurrentParents = [moduleId];
/******/ 					hotCurrentChildModule = request;
/******/ 				}
/******/ 				if (me.children.indexOf(request) === -1) {
/******/ 					me.children.push(request);
/******/ 				}
/******/ 			} else {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" +
/******/ 						request +
/******/ 						") from disposed module " +
/******/ 						moduleId
/******/ 				);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		var ObjectFactory = function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for (var name in __webpack_require__) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(__webpack_require__, name) &&
/******/ 				name !== "e" &&
/******/ 				name !== "t"
/******/ 			) {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId) {
/******/ 			if (hotStatus === "ready") hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/ 				finishChunkLoading();
/******/ 				throw err;
/******/ 			});
/******/
/******/ 			function finishChunkLoading() {
/******/ 				hotChunksLoading--;
/******/ 				if (hotStatus === "prepare") {
/******/ 					if (!hotWaitingFilesMap[chunkId]) {
/******/ 						hotEnsureUpdateChunk(chunkId);
/******/ 					}
/******/ 					if (hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 						hotUpdateDownloaded();
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		fn.t = function(value, mode) {
/******/ 			if (mode & 1) value = fn(value);
/******/ 			return __webpack_require__.t(value, mode & ~1);
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateModule(moduleId) {
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 			_main: hotCurrentChildModule !== moduleId,
/******/
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if (dep === undefined) hot._selfAccepted = true;
/******/ 				else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 				else if (typeof dep === "object")
/******/ 					for (var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				else hot._acceptedDependencies[dep] = callback || function() {};
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if (dep === undefined) hot._selfDeclined = true;
/******/ 				else if (typeof dep === "object")
/******/ 					for (var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 				else hot._declinedDependencies[dep] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if (!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if (idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		hotCurrentChildModule = undefined;
/******/ 		return hot;
/******/ 	}
/******/
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for (var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailableFilesMap = {};
/******/ 	var hotDeferred;
/******/
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = +id + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/
/******/ 	function hotCheck(apply) {
/******/ 		if (hotStatus !== "idle") {
/******/ 			throw new Error("check() is only allowed in idle status");
/******/ 		}
/******/ 		hotApplyOnUpdate = apply;
/******/ 		hotSetStatus("check");
/******/ 		return hotDownloadManifest(hotRequestTimeout).then(function(update) {
/******/ 			if (!update) {
/******/ 				hotSetStatus("idle");
/******/ 				return null;
/******/ 			}
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/
/******/ 			hotSetStatus("prepare");
/******/ 			var promise = new Promise(function(resolve, reject) {
/******/ 				hotDeferred = {
/******/ 					resolve: resolve,
/******/ 					reject: reject
/******/ 				};
/******/ 			});
/******/ 			hotUpdate = {};
/******/ 			var chunkId = "main";
/******/ 			// eslint-disable-next-line no-lone-blocks
/******/ 			{
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if (
/******/ 				hotStatus === "prepare" &&
/******/ 				hotChunksLoading === 0 &&
/******/ 				hotWaitingFiles === 0
/******/ 			) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 			return promise;
/******/ 		});
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) {
/******/ 		if (!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for (var moduleId in moreModules) {
/******/ 			if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if (--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if (!hotAvailableFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var deferred = hotDeferred;
/******/ 		hotDeferred = null;
/******/ 		if (!deferred) return;
/******/ 		if (hotApplyOnUpdate) {
/******/ 			// Wrap deferred object in Promise to mark it as a well-handled Promise to
/******/ 			// avoid triggering uncaught exception warning in Chrome.
/******/ 			// See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
/******/ 			Promise.resolve()
/******/ 				.then(function() {
/******/ 					return hotApply(hotApplyOnUpdate);
/******/ 				})
/******/ 				.then(
/******/ 					function(result) {
/******/ 						deferred.resolve(result);
/******/ 					},
/******/ 					function(err) {
/******/ 						deferred.reject(err);
/******/ 					}
/******/ 				);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for (var id in hotUpdate) {
/******/ 				if (Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			deferred.resolve(outdatedModules);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotApply(options) {
/******/ 		if (hotStatus !== "ready")
/******/ 			throw new Error("apply() is only allowed in ready status");
/******/ 		options = options || {};
/******/
/******/ 		var cb;
/******/ 		var i;
/******/ 		var j;
/******/ 		var module;
/******/ 		var moduleId;
/******/
/******/ 		function getAffectedStuff(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/
/******/ 			var queue = outdatedModules.map(function(id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while (queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				module = installedModules[moduleId];
/******/ 				if (!module || module.hot._selfAccepted) continue;
/******/ 				if (module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if (module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for (var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if (!parent) continue;
/******/ 					if (parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 					if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if (!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/
/******/ 		function addAllToSet(a, b) {
/******/ 			for (var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if (a.indexOf(item) === -1) a.push(item);
/******/ 			}
/******/ 		}
/******/
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/ 			console.warn(
/******/ 				"[HMR] unexpected require(" + result.moduleId + ") to disposed module"
/******/ 			);
/******/ 		};
/******/
/******/ 		for (var id in hotUpdate) {
/******/ 			if (Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				moduleId = toModuleId(id);
/******/ 				/** @type {TODO} */
/******/ 				var result;
/******/ 				if (hotUpdate[id]) {
/******/ 					result = getAffectedStuff(moduleId);
/******/ 				} else {
/******/ 					result = {
/******/ 						type: "disposed",
/******/ 						moduleId: id
/******/ 					};
/******/ 				}
/******/ 				/** @type {Error|false} */
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if (result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch (result.type) {
/******/ 					case "self-declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of self decline: " +
/******/ 									result.moduleId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of declined dependency: " +
/******/ 									result.moduleId +
/******/ 									" in " +
/******/ 									result.parentId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 						if (!options.ignoreUnaccepted)
/******/ 							abortError = new Error(
/******/ 								"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if (options.onAccepted) options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if (options.onDisposed) options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if (abortError) {
/******/ 					hotSetStatus("abort");
/******/ 					return Promise.reject(abortError);
/******/ 				}
/******/ 				if (doApply) {
/******/ 					appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for (moduleId in result.outdatedDependencies) {
/******/ 						if (
/******/ 							Object.prototype.hasOwnProperty.call(
/******/ 								result.outdatedDependencies,
/******/ 								moduleId
/******/ 							)
/******/ 						) {
/******/ 							if (!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(
/******/ 								outdatedDependencies[moduleId],
/******/ 								result.outdatedDependencies[moduleId]
/******/ 							);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if (doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for (i = 0; i < outdatedModules.length; i++) {
/******/ 			moduleId = outdatedModules[i];
/******/ 			if (
/******/ 				installedModules[moduleId] &&
/******/ 				installedModules[moduleId].hot._selfAccepted &&
/******/ 				// removed self-accepted modules should not be required
/******/ 				appliedUpdate[moduleId] !== warnUnexpectedRequire
/******/ 			) {
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 			}
/******/ 		}
/******/
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/ 			if (hotAvailableFilesMap[chunkId] === false) {
/******/ 				hotDisposeChunk(chunkId);
/******/ 			}
/******/ 		});
/******/
/******/ 		var idx;
/******/ 		var queue = outdatedModules.slice();
/******/ 		while (queue.length > 0) {
/******/ 			moduleId = queue.pop();
/******/ 			module = installedModules[moduleId];
/******/ 			if (!module) continue;
/******/
/******/ 			var data = {};
/******/
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for (j = 0; j < disposeHandlers.length; j++) {
/******/ 				cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/
/******/ 			// when disposing there is no need to call dispose handler
/******/ 			delete outdatedDependencies[moduleId];
/******/
/******/ 			// remove "parents" references from all children
/******/ 			for (j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if (!child) continue;
/******/ 				idx = child.parents.indexOf(moduleId);
/******/ 				if (idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// remove outdated dependency from module children
/******/ 		var dependency;
/******/ 		var moduleOutdatedDependencies;
/******/ 		for (moduleId in outdatedDependencies) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)
/******/ 			) {
/******/ 				module = installedModules[moduleId];
/******/ 				if (module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 						dependency = moduleOutdatedDependencies[j];
/******/ 						idx = module.children.indexOf(dependency);
/******/ 						if (idx >= 0) module.children.splice(idx, 1);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Now in "apply" phase
/******/ 		hotSetStatus("apply");
/******/
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/
/******/ 		// insert new code
/******/ 		for (moduleId in appliedUpdate) {
/******/ 			if (Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for (moduleId in outdatedDependencies) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)
/******/ 			) {
/******/ 				module = installedModules[moduleId];
/******/ 				if (module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					var callbacks = [];
/******/ 					for (i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 						dependency = moduleOutdatedDependencies[i];
/******/ 						cb = module.hot._acceptedDependencies[dependency];
/******/ 						if (cb) {
/******/ 							if (callbacks.indexOf(cb) !== -1) continue;
/******/ 							callbacks.push(cb);
/******/ 						}
/******/ 					}
/******/ 					for (i = 0; i < callbacks.length; i++) {
/******/ 						cb = callbacks[i];
/******/ 						try {
/******/ 							cb(moduleOutdatedDependencies);
/******/ 						} catch (err) {
/******/ 							if (options.onErrored) {
/******/ 								options.onErrored({
/******/ 									type: "accept-errored",
/******/ 									moduleId: moduleId,
/******/ 									dependencyId: moduleOutdatedDependencies[i],
/******/ 									error: err
/******/ 								});
/******/ 							}
/******/ 							if (!options.ignoreErrored) {
/******/ 								if (!error) error = err;
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Load self accepted modules
/******/ 		for (i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch (err) {
/******/ 				if (typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch (err2) {
/******/ 						if (options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "self-accept-error-handler-errored",
/******/ 								moduleId: moduleId,
/******/ 								error: err2,
/******/ 								originalError: err
/******/ 							});
/******/ 						}
/******/ 						if (!options.ignoreErrored) {
/******/ 							if (!error) error = err2;
/******/ 						}
/******/ 						if (!error) error = err;
/******/ 					}
/******/ 				} else {
/******/ 					if (options.onErrored) {
/******/ 						options.onErrored({
/******/ 							type: "self-accept-errored",
/******/ 							moduleId: moduleId,
/******/ 							error: err
/******/ 						});
/******/ 					}
/******/ 					if (!options.ignoreErrored) {
/******/ 						if (!error) error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if (error) {
/******/ 			hotSetStatus("fail");
/******/ 			return Promise.reject(error);
/******/ 		}
/******/
/******/ 		hotSetStatus("idle");
/******/ 		return new Promise(function(resolve) {
/******/ 			resolve(outdatedModules);
/******/ 		});
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/static/";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(0)(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/uuid/dist/esm-browser/bytesToUuid.js":
/*!***********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/bytesToUuid.js ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/**\n * Convert array of 16 byte values to UUID string format of the form:\n * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX\n */\nvar byteToHex = [];\n\nfor (var i = 0; i < 256; ++i) {\n  byteToHex[i] = (i + 0x100).toString(16).substr(1);\n}\n\nfunction bytesToUuid(buf, offset) {\n  var i = offset || 0;\n  var bth = byteToHex; // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4\n\n  return [bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]]].join('');\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (bytesToUuid);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvYnl0ZXNUb1V1aWQuanM/YjY5MSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsZUFBZSxTQUFTO0FBQ3hCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQjs7QUFFdEI7QUFDQTs7QUFFZSwwRUFBVyIsImZpbGUiOiIuL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvYnl0ZXNUb1V1aWQuanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvbnZlcnQgYXJyYXkgb2YgMTYgYnl0ZSB2YWx1ZXMgdG8gVVVJRCBzdHJpbmcgZm9ybWF0IG9mIHRoZSBmb3JtOlxuICogWFhYWFhYWFgtWFhYWC1YWFhYLVhYWFgtWFhYWFhYWFhYWFhYXG4gKi9cbnZhciBieXRlVG9IZXggPSBbXTtcblxuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXhbaV0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpO1xufVxuXG5mdW5jdGlvbiBieXRlc1RvVXVpZChidWYsIG9mZnNldCkge1xuICB2YXIgaSA9IG9mZnNldCB8fCAwO1xuICB2YXIgYnRoID0gYnl0ZVRvSGV4OyAvLyBqb2luIHVzZWQgdG8gZml4IG1lbW9yeSBpc3N1ZSBjYXVzZWQgYnkgY29uY2F0ZW5hdGlvbjogaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzE3NSNjNFxuXG4gIHJldHVybiBbYnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSwgJy0nLCBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCAnLScsIGJ0aFtidWZbaSsrXV0sIGJ0aFtidWZbaSsrXV0sICctJywgYnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSwgJy0nLCBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dXS5qb2luKCcnKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYnl0ZXNUb1V1aWQ7Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./node_modules/uuid/dist/esm-browser/bytesToUuid.js\n");

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/index.js ***!
  \*****************************************************/
/*! exports provided: v1, v3, v4, v5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _v1_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./v1.js */ \"./node_modules/uuid/dist/esm-browser/v1.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"v1\", function() { return _v1_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]; });\n\n/* harmony import */ var _v3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./v3.js */ \"./node_modules/uuid/dist/esm-browser/v3.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"v3\", function() { return _v3_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"]; });\n\n/* harmony import */ var _v4_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./v4.js */ \"./node_modules/uuid/dist/esm-browser/v4.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"v4\", function() { return _v4_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"]; });\n\n/* harmony import */ var _v5_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./v5.js */ \"./node_modules/uuid/dist/esm-browser/v5.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"v5\", function() { return _v5_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"]; });\n\n\n\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvaW5kZXguanM/ZTE0NCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUF3QztBQUNBO0FBQ0EiLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL2luZGV4LmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHsgZGVmYXVsdCBhcyB2MSB9IGZyb20gJy4vdjEuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyB2MyB9IGZyb20gJy4vdjMuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyB2NCB9IGZyb20gJy4vdjQuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyB2NSB9IGZyb20gJy4vdjUuanMnOyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./node_modules/uuid/dist/esm-browser/index.js\n");

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/md5.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/md5.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/*\n * Browser-compatible JavaScript MD5\n *\n * Modification of JavaScript MD5\n * https://github.com/blueimp/JavaScript-MD5\n *\n * Copyright 2011, Sebastian Tschan\n * https://blueimp.net\n *\n * Licensed under the MIT license:\n * https://opensource.org/licenses/MIT\n *\n * Based on\n * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message\n * Digest Algorithm, as defined in RFC 1321.\n * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009\n * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet\n * Distributed under the BSD License\n * See http://pajhome.org.uk/crypt/md5 for more info.\n */\nfunction md5(bytes) {\n  if (typeof bytes == 'string') {\n    var msg = unescape(encodeURIComponent(bytes)); // UTF8 escape\n\n    bytes = new Array(msg.length);\n\n    for (var i = 0; i < msg.length; i++) {\n      bytes[i] = msg.charCodeAt(i);\n    }\n  }\n\n  return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));\n}\n/*\n * Convert an array of little-endian words to an array of bytes\n */\n\n\nfunction md5ToHexEncodedArray(input) {\n  var i;\n  var x;\n  var output = [];\n  var length32 = input.length * 32;\n  var hexTab = '0123456789abcdef';\n  var hex;\n\n  for (i = 0; i < length32; i += 8) {\n    x = input[i >> 5] >>> i % 32 & 0xff;\n    hex = parseInt(hexTab.charAt(x >>> 4 & 0x0f) + hexTab.charAt(x & 0x0f), 16);\n    output.push(hex);\n  }\n\n  return output;\n}\n/*\n * Calculate the MD5 of an array of little-endian words, and a bit length.\n */\n\n\nfunction wordsToMd5(x, len) {\n  /* append padding */\n  x[len >> 5] |= 0x80 << len % 32;\n  x[(len + 64 >>> 9 << 4) + 14] = len;\n  var i;\n  var olda;\n  var oldb;\n  var oldc;\n  var oldd;\n  var a = 1732584193;\n  var b = -271733879;\n  var c = -1732584194;\n  var d = 271733878;\n\n  for (i = 0; i < x.length; i += 16) {\n    olda = a;\n    oldb = b;\n    oldc = c;\n    oldd = d;\n    a = md5ff(a, b, c, d, x[i], 7, -680876936);\n    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);\n    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);\n    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);\n    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);\n    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);\n    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);\n    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);\n    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);\n    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);\n    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);\n    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);\n    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);\n    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);\n    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);\n    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);\n    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);\n    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);\n    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);\n    b = md5gg(b, c, d, a, x[i], 20, -373897302);\n    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);\n    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);\n    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);\n    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);\n    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);\n    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);\n    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);\n    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);\n    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);\n    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);\n    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);\n    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);\n    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);\n    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);\n    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);\n    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);\n    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);\n    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);\n    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);\n    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);\n    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);\n    d = md5hh(d, a, b, c, x[i], 11, -358537222);\n    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);\n    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);\n    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);\n    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);\n    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);\n    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);\n    a = md5ii(a, b, c, d, x[i], 6, -198630844);\n    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);\n    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);\n    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);\n    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);\n    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);\n    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);\n    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);\n    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);\n    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);\n    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);\n    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);\n    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);\n    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);\n    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);\n    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);\n    a = safeAdd(a, olda);\n    b = safeAdd(b, oldb);\n    c = safeAdd(c, oldc);\n    d = safeAdd(d, oldd);\n  }\n\n  return [a, b, c, d];\n}\n/*\n * Convert an array bytes to an array of little-endian words\n * Characters >255 have their high-byte silently ignored.\n */\n\n\nfunction bytesToWords(input) {\n  var i;\n  var output = [];\n  output[(input.length >> 2) - 1] = undefined;\n\n  for (i = 0; i < output.length; i += 1) {\n    output[i] = 0;\n  }\n\n  var length8 = input.length * 8;\n\n  for (i = 0; i < length8; i += 8) {\n    output[i >> 5] |= (input[i / 8] & 0xff) << i % 32;\n  }\n\n  return output;\n}\n/*\n * Add integers, wrapping at 2^32. This uses 16-bit operations internally\n * to work around bugs in some JS interpreters.\n */\n\n\nfunction safeAdd(x, y) {\n  var lsw = (x & 0xffff) + (y & 0xffff);\n  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);\n  return msw << 16 | lsw & 0xffff;\n}\n/*\n * Bitwise rotate a 32-bit number to the left.\n */\n\n\nfunction bitRotateLeft(num, cnt) {\n  return num << cnt | num >>> 32 - cnt;\n}\n/*\n * These functions implement the four basic operations the algorithm uses.\n */\n\n\nfunction md5cmn(q, a, b, x, s, t) {\n  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);\n}\n\nfunction md5ff(a, b, c, d, x, s, t) {\n  return md5cmn(b & c | ~b & d, a, b, x, s, t);\n}\n\nfunction md5gg(a, b, c, d, x, s, t) {\n  return md5cmn(b & d | c & ~d, a, b, x, s, t);\n}\n\nfunction md5hh(a, b, c, d, x, s, t) {\n  return md5cmn(b ^ c ^ d, a, b, x, s, t);\n}\n\nfunction md5ii(a, b, c, d, x, s, t) {\n  return md5cmn(c ^ (b | ~d), a, b, x, s, t);\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (md5);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvbWQ1LmpzP2I3MmIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFrRDs7QUFFbEQ7O0FBRUEsbUJBQW1CLGdCQUFnQjtBQUNuQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsYUFBYSxjQUFjO0FBQzNCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGFBQWEsY0FBYztBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGFBQWEsbUJBQW1CO0FBQ2hDO0FBQ0E7O0FBRUE7O0FBRUEsYUFBYSxhQUFhO0FBQzFCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRWUsa0VBQUciLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL21kNS5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBCcm93c2VyLWNvbXBhdGlibGUgSmF2YVNjcmlwdCBNRDVcbiAqXG4gKiBNb2RpZmljYXRpb24gb2YgSmF2YVNjcmlwdCBNRDVcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9ibHVlaW1wL0phdmFTY3JpcHQtTUQ1XG4gKlxuICogQ29weXJpZ2h0IDIwMTEsIFNlYmFzdGlhbiBUc2NoYW5cbiAqIGh0dHBzOi8vYmx1ZWltcC5uZXRcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwczovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICpcbiAqIEJhc2VkIG9uXG4gKiBBIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb24gb2YgdGhlIFJTQSBEYXRhIFNlY3VyaXR5LCBJbmMuIE1ENSBNZXNzYWdlXG4gKiBEaWdlc3QgQWxnb3JpdGhtLCBhcyBkZWZpbmVkIGluIFJGQyAxMzIxLlxuICogVmVyc2lvbiAyLjIgQ29weXJpZ2h0IChDKSBQYXVsIEpvaG5zdG9uIDE5OTkgLSAyMDA5XG4gKiBPdGhlciBjb250cmlidXRvcnM6IEdyZWcgSG9sdCwgQW5kcmV3IEtlcGVydCwgWWRuYXIsIExvc3RpbmV0XG4gKiBEaXN0cmlidXRlZCB1bmRlciB0aGUgQlNEIExpY2Vuc2VcbiAqIFNlZSBodHRwOi8vcGFqaG9tZS5vcmcudWsvY3J5cHQvbWQ1IGZvciBtb3JlIGluZm8uXG4gKi9cbmZ1bmN0aW9uIG1kNShieXRlcykge1xuICBpZiAodHlwZW9mIGJ5dGVzID09ICdzdHJpbmcnKSB7XG4gICAgdmFyIG1zZyA9IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChieXRlcykpOyAvLyBVVEY4IGVzY2FwZVxuXG4gICAgYnl0ZXMgPSBuZXcgQXJyYXkobXNnLmxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1zZy5sZW5ndGg7IGkrKykge1xuICAgICAgYnl0ZXNbaV0gPSBtc2cuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWQ1VG9IZXhFbmNvZGVkQXJyYXkod29yZHNUb01kNShieXRlc1RvV29yZHMoYnl0ZXMpLCBieXRlcy5sZW5ndGggKiA4KSk7XG59XG4vKlxuICogQ29udmVydCBhbiBhcnJheSBvZiBsaXR0bGUtZW5kaWFuIHdvcmRzIHRvIGFuIGFycmF5IG9mIGJ5dGVzXG4gKi9cblxuXG5mdW5jdGlvbiBtZDVUb0hleEVuY29kZWRBcnJheShpbnB1dCkge1xuICB2YXIgaTtcbiAgdmFyIHg7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgdmFyIGxlbmd0aDMyID0gaW5wdXQubGVuZ3RoICogMzI7XG4gIHZhciBoZXhUYWIgPSAnMDEyMzQ1Njc4OWFiY2RlZic7XG4gIHZhciBoZXg7XG5cbiAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDMyOyBpICs9IDgpIHtcbiAgICB4ID0gaW5wdXRbaSA+PiA1XSA+Pj4gaSAlIDMyICYgMHhmZjtcbiAgICBoZXggPSBwYXJzZUludChoZXhUYWIuY2hhckF0KHggPj4+IDQgJiAweDBmKSArIGhleFRhYi5jaGFyQXQoeCAmIDB4MGYpLCAxNik7XG4gICAgb3V0cHV0LnB1c2goaGV4KTtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59XG4vKlxuICogQ2FsY3VsYXRlIHRoZSBNRDUgb2YgYW4gYXJyYXkgb2YgbGl0dGxlLWVuZGlhbiB3b3JkcywgYW5kIGEgYml0IGxlbmd0aC5cbiAqL1xuXG5cbmZ1bmN0aW9uIHdvcmRzVG9NZDUoeCwgbGVuKSB7XG4gIC8qIGFwcGVuZCBwYWRkaW5nICovXG4gIHhbbGVuID4+IDVdIHw9IDB4ODAgPDwgbGVuICUgMzI7XG4gIHhbKGxlbiArIDY0ID4+PiA5IDw8IDQpICsgMTRdID0gbGVuO1xuICB2YXIgaTtcbiAgdmFyIG9sZGE7XG4gIHZhciBvbGRiO1xuICB2YXIgb2xkYztcbiAgdmFyIG9sZGQ7XG4gIHZhciBhID0gMTczMjU4NDE5MztcbiAgdmFyIGIgPSAtMjcxNzMzODc5O1xuICB2YXIgYyA9IC0xNzMyNTg0MTk0O1xuICB2YXIgZCA9IDI3MTczMzg3ODtcblxuICBmb3IgKGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkgKz0gMTYpIHtcbiAgICBvbGRhID0gYTtcbiAgICBvbGRiID0gYjtcbiAgICBvbGRjID0gYztcbiAgICBvbGRkID0gZDtcbiAgICBhID0gbWQ1ZmYoYSwgYiwgYywgZCwgeFtpXSwgNywgLTY4MDg3NjkzNik7XG4gICAgZCA9IG1kNWZmKGQsIGEsIGIsIGMsIHhbaSArIDFdLCAxMiwgLTM4OTU2NDU4Nik7XG4gICAgYyA9IG1kNWZmKGMsIGQsIGEsIGIsIHhbaSArIDJdLCAxNywgNjA2MTA1ODE5KTtcbiAgICBiID0gbWQ1ZmYoYiwgYywgZCwgYSwgeFtpICsgM10sIDIyLCAtMTA0NDUyNTMzMCk7XG4gICAgYSA9IG1kNWZmKGEsIGIsIGMsIGQsIHhbaSArIDRdLCA3LCAtMTc2NDE4ODk3KTtcbiAgICBkID0gbWQ1ZmYoZCwgYSwgYiwgYywgeFtpICsgNV0sIDEyLCAxMjAwMDgwNDI2KTtcbiAgICBjID0gbWQ1ZmYoYywgZCwgYSwgYiwgeFtpICsgNl0sIDE3LCAtMTQ3MzIzMTM0MSk7XG4gICAgYiA9IG1kNWZmKGIsIGMsIGQsIGEsIHhbaSArIDddLCAyMiwgLTQ1NzA1OTgzKTtcbiAgICBhID0gbWQ1ZmYoYSwgYiwgYywgZCwgeFtpICsgOF0sIDcsIDE3NzAwMzU0MTYpO1xuICAgIGQgPSBtZDVmZihkLCBhLCBiLCBjLCB4W2kgKyA5XSwgMTIsIC0xOTU4NDE0NDE3KTtcbiAgICBjID0gbWQ1ZmYoYywgZCwgYSwgYiwgeFtpICsgMTBdLCAxNywgLTQyMDYzKTtcbiAgICBiID0gbWQ1ZmYoYiwgYywgZCwgYSwgeFtpICsgMTFdLCAyMiwgLTE5OTA0MDQxNjIpO1xuICAgIGEgPSBtZDVmZihhLCBiLCBjLCBkLCB4W2kgKyAxMl0sIDcsIDE4MDQ2MDM2ODIpO1xuICAgIGQgPSBtZDVmZihkLCBhLCBiLCBjLCB4W2kgKyAxM10sIDEyLCAtNDAzNDExMDEpO1xuICAgIGMgPSBtZDVmZihjLCBkLCBhLCBiLCB4W2kgKyAxNF0sIDE3LCAtMTUwMjAwMjI5MCk7XG4gICAgYiA9IG1kNWZmKGIsIGMsIGQsIGEsIHhbaSArIDE1XSwgMjIsIDEyMzY1MzUzMjkpO1xuICAgIGEgPSBtZDVnZyhhLCBiLCBjLCBkLCB4W2kgKyAxXSwgNSwgLTE2NTc5NjUxMCk7XG4gICAgZCA9IG1kNWdnKGQsIGEsIGIsIGMsIHhbaSArIDZdLCA5LCAtMTA2OTUwMTYzMik7XG4gICAgYyA9IG1kNWdnKGMsIGQsIGEsIGIsIHhbaSArIDExXSwgMTQsIDY0MzcxNzcxMyk7XG4gICAgYiA9IG1kNWdnKGIsIGMsIGQsIGEsIHhbaV0sIDIwLCAtMzczODk3MzAyKTtcbiAgICBhID0gbWQ1Z2coYSwgYiwgYywgZCwgeFtpICsgNV0sIDUsIC03MDE1NTg2OTEpO1xuICAgIGQgPSBtZDVnZyhkLCBhLCBiLCBjLCB4W2kgKyAxMF0sIDksIDM4MDE2MDgzKTtcbiAgICBjID0gbWQ1Z2coYywgZCwgYSwgYiwgeFtpICsgMTVdLCAxNCwgLTY2MDQ3ODMzNSk7XG4gICAgYiA9IG1kNWdnKGIsIGMsIGQsIGEsIHhbaSArIDRdLCAyMCwgLTQwNTUzNzg0OCk7XG4gICAgYSA9IG1kNWdnKGEsIGIsIGMsIGQsIHhbaSArIDldLCA1LCA1Njg0NDY0MzgpO1xuICAgIGQgPSBtZDVnZyhkLCBhLCBiLCBjLCB4W2kgKyAxNF0sIDksIC0xMDE5ODAzNjkwKTtcbiAgICBjID0gbWQ1Z2coYywgZCwgYSwgYiwgeFtpICsgM10sIDE0LCAtMTg3MzYzOTYxKTtcbiAgICBiID0gbWQ1Z2coYiwgYywgZCwgYSwgeFtpICsgOF0sIDIwLCAxMTYzNTMxNTAxKTtcbiAgICBhID0gbWQ1Z2coYSwgYiwgYywgZCwgeFtpICsgMTNdLCA1LCAtMTQ0NDY4MTQ2Nyk7XG4gICAgZCA9IG1kNWdnKGQsIGEsIGIsIGMsIHhbaSArIDJdLCA5LCAtNTE0MDM3ODQpO1xuICAgIGMgPSBtZDVnZyhjLCBkLCBhLCBiLCB4W2kgKyA3XSwgMTQsIDE3MzUzMjg0NzMpO1xuICAgIGIgPSBtZDVnZyhiLCBjLCBkLCBhLCB4W2kgKyAxMl0sIDIwLCAtMTkyNjYwNzczNCk7XG4gICAgYSA9IG1kNWhoKGEsIGIsIGMsIGQsIHhbaSArIDVdLCA0LCAtMzc4NTU4KTtcbiAgICBkID0gbWQ1aGgoZCwgYSwgYiwgYywgeFtpICsgOF0sIDExLCAtMjAyMjU3NDQ2Myk7XG4gICAgYyA9IG1kNWhoKGMsIGQsIGEsIGIsIHhbaSArIDExXSwgMTYsIDE4MzkwMzA1NjIpO1xuICAgIGIgPSBtZDVoaChiLCBjLCBkLCBhLCB4W2kgKyAxNF0sIDIzLCAtMzUzMDk1NTYpO1xuICAgIGEgPSBtZDVoaChhLCBiLCBjLCBkLCB4W2kgKyAxXSwgNCwgLTE1MzA5OTIwNjApO1xuICAgIGQgPSBtZDVoaChkLCBhLCBiLCBjLCB4W2kgKyA0XSwgMTEsIDEyNzI4OTMzNTMpO1xuICAgIGMgPSBtZDVoaChjLCBkLCBhLCBiLCB4W2kgKyA3XSwgMTYsIC0xNTU0OTc2MzIpO1xuICAgIGIgPSBtZDVoaChiLCBjLCBkLCBhLCB4W2kgKyAxMF0sIDIzLCAtMTA5NDczMDY0MCk7XG4gICAgYSA9IG1kNWhoKGEsIGIsIGMsIGQsIHhbaSArIDEzXSwgNCwgNjgxMjc5MTc0KTtcbiAgICBkID0gbWQ1aGgoZCwgYSwgYiwgYywgeFtpXSwgMTEsIC0zNTg1MzcyMjIpO1xuICAgIGMgPSBtZDVoaChjLCBkLCBhLCBiLCB4W2kgKyAzXSwgMTYsIC03MjI1MjE5NzkpO1xuICAgIGIgPSBtZDVoaChiLCBjLCBkLCBhLCB4W2kgKyA2XSwgMjMsIDc2MDI5MTg5KTtcbiAgICBhID0gbWQ1aGgoYSwgYiwgYywgZCwgeFtpICsgOV0sIDQsIC02NDAzNjQ0ODcpO1xuICAgIGQgPSBtZDVoaChkLCBhLCBiLCBjLCB4W2kgKyAxMl0sIDExLCAtNDIxODE1ODM1KTtcbiAgICBjID0gbWQ1aGgoYywgZCwgYSwgYiwgeFtpICsgMTVdLCAxNiwgNTMwNzQyNTIwKTtcbiAgICBiID0gbWQ1aGgoYiwgYywgZCwgYSwgeFtpICsgMl0sIDIzLCAtOTk1MzM4NjUxKTtcbiAgICBhID0gbWQ1aWkoYSwgYiwgYywgZCwgeFtpXSwgNiwgLTE5ODYzMDg0NCk7XG4gICAgZCA9IG1kNWlpKGQsIGEsIGIsIGMsIHhbaSArIDddLCAxMCwgMTEyNjg5MTQxNSk7XG4gICAgYyA9IG1kNWlpKGMsIGQsIGEsIGIsIHhbaSArIDE0XSwgMTUsIC0xNDE2MzU0OTA1KTtcbiAgICBiID0gbWQ1aWkoYiwgYywgZCwgYSwgeFtpICsgNV0sIDIxLCAtNTc0MzQwNTUpO1xuICAgIGEgPSBtZDVpaShhLCBiLCBjLCBkLCB4W2kgKyAxMl0sIDYsIDE3MDA0ODU1NzEpO1xuICAgIGQgPSBtZDVpaShkLCBhLCBiLCBjLCB4W2kgKyAzXSwgMTAsIC0xODk0OTg2NjA2KTtcbiAgICBjID0gbWQ1aWkoYywgZCwgYSwgYiwgeFtpICsgMTBdLCAxNSwgLTEwNTE1MjMpO1xuICAgIGIgPSBtZDVpaShiLCBjLCBkLCBhLCB4W2kgKyAxXSwgMjEsIC0yMDU0OTIyNzk5KTtcbiAgICBhID0gbWQ1aWkoYSwgYiwgYywgZCwgeFtpICsgOF0sIDYsIDE4NzMzMTMzNTkpO1xuICAgIGQgPSBtZDVpaShkLCBhLCBiLCBjLCB4W2kgKyAxNV0sIDEwLCAtMzA2MTE3NDQpO1xuICAgIGMgPSBtZDVpaShjLCBkLCBhLCBiLCB4W2kgKyA2XSwgMTUsIC0xNTYwMTk4MzgwKTtcbiAgICBiID0gbWQ1aWkoYiwgYywgZCwgYSwgeFtpICsgMTNdLCAyMSwgMTMwOTE1MTY0OSk7XG4gICAgYSA9IG1kNWlpKGEsIGIsIGMsIGQsIHhbaSArIDRdLCA2LCAtMTQ1NTIzMDcwKTtcbiAgICBkID0gbWQ1aWkoZCwgYSwgYiwgYywgeFtpICsgMTFdLCAxMCwgLTExMjAyMTAzNzkpO1xuICAgIGMgPSBtZDVpaShjLCBkLCBhLCBiLCB4W2kgKyAyXSwgMTUsIDcxODc4NzI1OSk7XG4gICAgYiA9IG1kNWlpKGIsIGMsIGQsIGEsIHhbaSArIDldLCAyMSwgLTM0MzQ4NTU1MSk7XG4gICAgYSA9IHNhZmVBZGQoYSwgb2xkYSk7XG4gICAgYiA9IHNhZmVBZGQoYiwgb2xkYik7XG4gICAgYyA9IHNhZmVBZGQoYywgb2xkYyk7XG4gICAgZCA9IHNhZmVBZGQoZCwgb2xkZCk7XG4gIH1cblxuICByZXR1cm4gW2EsIGIsIGMsIGRdO1xufVxuLypcbiAqIENvbnZlcnQgYW4gYXJyYXkgYnl0ZXMgdG8gYW4gYXJyYXkgb2YgbGl0dGxlLWVuZGlhbiB3b3Jkc1xuICogQ2hhcmFjdGVycyA+MjU1IGhhdmUgdGhlaXIgaGlnaC1ieXRlIHNpbGVudGx5IGlnbm9yZWQuXG4gKi9cblxuXG5mdW5jdGlvbiBieXRlc1RvV29yZHMoaW5wdXQpIHtcbiAgdmFyIGk7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgb3V0cHV0WyhpbnB1dC5sZW5ndGggPj4gMikgLSAxXSA9IHVuZGVmaW5lZDtcblxuICBmb3IgKGkgPSAwOyBpIDwgb3V0cHV0Lmxlbmd0aDsgaSArPSAxKSB7XG4gICAgb3V0cHV0W2ldID0gMDtcbiAgfVxuXG4gIHZhciBsZW5ndGg4ID0gaW5wdXQubGVuZ3RoICogODtcblxuICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoODsgaSArPSA4KSB7XG4gICAgb3V0cHV0W2kgPj4gNV0gfD0gKGlucHV0W2kgLyA4XSAmIDB4ZmYpIDw8IGkgJSAzMjtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59XG4vKlxuICogQWRkIGludGVnZXJzLCB3cmFwcGluZyBhdCAyXjMyLiBUaGlzIHVzZXMgMTYtYml0IG9wZXJhdGlvbnMgaW50ZXJuYWxseVxuICogdG8gd29yayBhcm91bmQgYnVncyBpbiBzb21lIEpTIGludGVycHJldGVycy5cbiAqL1xuXG5cbmZ1bmN0aW9uIHNhZmVBZGQoeCwgeSkge1xuICB2YXIgbHN3ID0gKHggJiAweGZmZmYpICsgKHkgJiAweGZmZmYpO1xuICB2YXIgbXN3ID0gKHggPj4gMTYpICsgKHkgPj4gMTYpICsgKGxzdyA+PiAxNik7XG4gIHJldHVybiBtc3cgPDwgMTYgfCBsc3cgJiAweGZmZmY7XG59XG4vKlxuICogQml0d2lzZSByb3RhdGUgYSAzMi1iaXQgbnVtYmVyIHRvIHRoZSBsZWZ0LlxuICovXG5cblxuZnVuY3Rpb24gYml0Um90YXRlTGVmdChudW0sIGNudCkge1xuICByZXR1cm4gbnVtIDw8IGNudCB8IG51bSA+Pj4gMzIgLSBjbnQ7XG59XG4vKlxuICogVGhlc2UgZnVuY3Rpb25zIGltcGxlbWVudCB0aGUgZm91ciBiYXNpYyBvcGVyYXRpb25zIHRoZSBhbGdvcml0aG0gdXNlcy5cbiAqL1xuXG5cbmZ1bmN0aW9uIG1kNWNtbihxLCBhLCBiLCB4LCBzLCB0KSB7XG4gIHJldHVybiBzYWZlQWRkKGJpdFJvdGF0ZUxlZnQoc2FmZUFkZChzYWZlQWRkKGEsIHEpLCBzYWZlQWRkKHgsIHQpKSwgcyksIGIpO1xufVxuXG5mdW5jdGlvbiBtZDVmZihhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XG4gIHJldHVybiBtZDVjbW4oYiAmIGMgfCB+YiAmIGQsIGEsIGIsIHgsIHMsIHQpO1xufVxuXG5mdW5jdGlvbiBtZDVnZyhhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XG4gIHJldHVybiBtZDVjbW4oYiAmIGQgfCBjICYgfmQsIGEsIGIsIHgsIHMsIHQpO1xufVxuXG5mdW5jdGlvbiBtZDVoaChhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XG4gIHJldHVybiBtZDVjbW4oYiBeIGMgXiBkLCBhLCBiLCB4LCBzLCB0KTtcbn1cblxuZnVuY3Rpb24gbWQ1aWkoYSwgYiwgYywgZCwgeCwgcywgdCkge1xuICByZXR1cm4gbWQ1Y21uKGMgXiAoYiB8IH5kKSwgYSwgYiwgeCwgcywgdCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1kNTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./node_modules/uuid/dist/esm-browser/md5.js\n");

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/rng.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/rng.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return rng; });\n// Unique ID creation requires a high quality random # generator. In the browser we therefore\n// require the crypto API and do not support built-in fallback to lower quality random number\n// generators (like Math.random()).\n// getRandomValues needs to be invoked in a context where \"this\" is a Crypto implementation. Also,\n// find the complete implementation of crypto (msCrypto) on IE11.\nvar getRandomValues = typeof crypto != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto != 'undefined' && typeof msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto);\nvar rnds8 = new Uint8Array(16); // eslint-disable-line no-undef\n\nfunction rng() {\n  if (!getRandomValues) {\n    throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');\n  }\n\n  return getRandomValues(rnds8);\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvcm5nLmpzP2Q4ZjgiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjs7QUFFaEI7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQSIsImZpbGUiOiIuL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvcm5nLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVW5pcXVlIElEIGNyZWF0aW9uIHJlcXVpcmVzIGEgaGlnaCBxdWFsaXR5IHJhbmRvbSAjIGdlbmVyYXRvci4gSW4gdGhlIGJyb3dzZXIgd2UgdGhlcmVmb3JlXG4vLyByZXF1aXJlIHRoZSBjcnlwdG8gQVBJIGFuZCBkbyBub3Qgc3VwcG9ydCBidWlsdC1pbiBmYWxsYmFjayB0byBsb3dlciBxdWFsaXR5IHJhbmRvbSBudW1iZXJcbi8vIGdlbmVyYXRvcnMgKGxpa2UgTWF0aC5yYW5kb20oKSkuXG4vLyBnZXRSYW5kb21WYWx1ZXMgbmVlZHMgdG8gYmUgaW52b2tlZCBpbiBhIGNvbnRleHQgd2hlcmUgXCJ0aGlzXCIgaXMgYSBDcnlwdG8gaW1wbGVtZW50YXRpb24uIEFsc28sXG4vLyBmaW5kIHRoZSBjb21wbGV0ZSBpbXBsZW1lbnRhdGlvbiBvZiBjcnlwdG8gKG1zQ3J5cHRvKSBvbiBJRTExLlxudmFyIGdldFJhbmRvbVZhbHVlcyA9IHR5cGVvZiBjcnlwdG8gIT0gJ3VuZGVmaW5lZCcgJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzLmJpbmQoY3J5cHRvKSB8fCB0eXBlb2YgbXNDcnlwdG8gIT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcyA9PSAnZnVuY3Rpb24nICYmIG1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKG1zQ3J5cHRvKTtcbnZhciBybmRzOCA9IG5ldyBVaW50OEFycmF5KDE2KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBybmcoKSB7XG4gIGlmICghZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKCkgbm90IHN1cHBvcnRlZC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS91dWlkanMvdXVpZCNnZXRyYW5kb212YWx1ZXMtbm90LXN1cHBvcnRlZCcpO1xuICB9XG5cbiAgcmV0dXJuIGdldFJhbmRvbVZhbHVlcyhybmRzOCk7XG59Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./node_modules/uuid/dist/esm-browser/rng.js\n");

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/sha1.js":
/*!****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/sha1.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n// Adapted from Chris Veness' SHA1 code at\n// http://www.movable-type.co.uk/scripts/sha1.html\nfunction f(s, x, y, z) {\n  switch (s) {\n    case 0:\n      return x & y ^ ~x & z;\n\n    case 1:\n      return x ^ y ^ z;\n\n    case 2:\n      return x & y ^ x & z ^ y & z;\n\n    case 3:\n      return x ^ y ^ z;\n  }\n}\n\nfunction ROTL(x, n) {\n  return x << n | x >>> 32 - n;\n}\n\nfunction sha1(bytes) {\n  var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];\n  var H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];\n\n  if (typeof bytes == 'string') {\n    var msg = unescape(encodeURIComponent(bytes)); // UTF8 escape\n\n    bytes = new Array(msg.length);\n\n    for (var i = 0; i < msg.length; i++) {\n      bytes[i] = msg.charCodeAt(i);\n    }\n  }\n\n  bytes.push(0x80);\n  var l = bytes.length / 4 + 2;\n  var N = Math.ceil(l / 16);\n  var M = new Array(N);\n\n  for (var i = 0; i < N; i++) {\n    M[i] = new Array(16);\n\n    for (var j = 0; j < 16; j++) {\n      M[i][j] = bytes[i * 64 + j * 4] << 24 | bytes[i * 64 + j * 4 + 1] << 16 | bytes[i * 64 + j * 4 + 2] << 8 | bytes[i * 64 + j * 4 + 3];\n    }\n  }\n\n  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);\n  M[N - 1][14] = Math.floor(M[N - 1][14]);\n  M[N - 1][15] = (bytes.length - 1) * 8 & 0xffffffff;\n\n  for (var i = 0; i < N; i++) {\n    var W = new Array(80);\n\n    for (var t = 0; t < 16; t++) {\n      W[t] = M[i][t];\n    }\n\n    for (var t = 16; t < 80; t++) {\n      W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);\n    }\n\n    var a = H[0];\n    var b = H[1];\n    var c = H[2];\n    var d = H[3];\n    var e = H[4];\n\n    for (var t = 0; t < 80; t++) {\n      var s = Math.floor(t / 20);\n      var T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;\n      e = d;\n      d = c;\n      c = ROTL(b, 30) >>> 0;\n      b = a;\n      a = T;\n    }\n\n    H[0] = H[0] + a >>> 0;\n    H[1] = H[1] + b >>> 0;\n    H[2] = H[2] + c >>> 0;\n    H[3] = H[3] + d >>> 0;\n    H[4] = H[4] + e >>> 0;\n  }\n\n  return [H[0] >> 24 & 0xff, H[0] >> 16 & 0xff, H[0] >> 8 & 0xff, H[0] & 0xff, H[1] >> 24 & 0xff, H[1] >> 16 & 0xff, H[1] >> 8 & 0xff, H[1] & 0xff, H[2] >> 24 & 0xff, H[2] >> 16 & 0xff, H[2] >> 8 & 0xff, H[2] & 0xff, H[3] >> 24 & 0xff, H[3] >> 16 & 0xff, H[3] >> 8 & 0xff, H[3] & 0xff, H[4] >> 24 & 0xff, H[4] >> 16 & 0xff, H[4] >> 8 & 0xff, H[4] & 0xff];\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (sha1);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvc2hhMS5qcz9iNzVkIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0Esa0RBQWtEOztBQUVsRDs7QUFFQSxtQkFBbUIsZ0JBQWdCO0FBQ25DO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpQkFBaUIsT0FBTztBQUN4Qjs7QUFFQSxtQkFBbUIsUUFBUTtBQUMzQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLGlCQUFpQixPQUFPO0FBQ3hCOztBQUVBLG1CQUFtQixRQUFRO0FBQzNCO0FBQ0E7O0FBRUEsb0JBQW9CLFFBQVE7QUFDNUI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLG1CQUFtQixRQUFRO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRWUsbUVBQUkiLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3NoYTEuanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBBZGFwdGVkIGZyb20gQ2hyaXMgVmVuZXNzJyBTSEExIGNvZGUgYXRcbi8vIGh0dHA6Ly93d3cubW92YWJsZS10eXBlLmNvLnVrL3NjcmlwdHMvc2hhMS5odG1sXG5mdW5jdGlvbiBmKHMsIHgsIHksIHopIHtcbiAgc3dpdGNoIChzKSB7XG4gICAgY2FzZSAwOlxuICAgICAgcmV0dXJuIHggJiB5IF4gfnggJiB6O1xuXG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIHggXiB5IF4gejtcblxuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiB4ICYgeSBeIHggJiB6IF4geSAmIHo7XG5cbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4geCBeIHkgXiB6O1xuICB9XG59XG5cbmZ1bmN0aW9uIFJPVEwoeCwgbikge1xuICByZXR1cm4geCA8PCBuIHwgeCA+Pj4gMzIgLSBuO1xufVxuXG5mdW5jdGlvbiBzaGExKGJ5dGVzKSB7XG4gIHZhciBLID0gWzB4NWE4Mjc5OTksIDB4NmVkOWViYTEsIDB4OGYxYmJjZGMsIDB4Y2E2MmMxZDZdO1xuICB2YXIgSCA9IFsweDY3NDUyMzAxLCAweGVmY2RhYjg5LCAweDk4YmFkY2ZlLCAweDEwMzI1NDc2LCAweGMzZDJlMWYwXTtcblxuICBpZiAodHlwZW9mIGJ5dGVzID09ICdzdHJpbmcnKSB7XG4gICAgdmFyIG1zZyA9IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChieXRlcykpOyAvLyBVVEY4IGVzY2FwZVxuXG4gICAgYnl0ZXMgPSBuZXcgQXJyYXkobXNnLmxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1zZy5sZW5ndGg7IGkrKykge1xuICAgICAgYnl0ZXNbaV0gPSBtc2cuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gIH1cblxuICBieXRlcy5wdXNoKDB4ODApO1xuICB2YXIgbCA9IGJ5dGVzLmxlbmd0aCAvIDQgKyAyO1xuICB2YXIgTiA9IE1hdGguY2VpbChsIC8gMTYpO1xuICB2YXIgTSA9IG5ldyBBcnJheShOKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IE47IGkrKykge1xuICAgIE1baV0gPSBuZXcgQXJyYXkoMTYpO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCAxNjsgaisrKSB7XG4gICAgICBNW2ldW2pdID0gYnl0ZXNbaSAqIDY0ICsgaiAqIDRdIDw8IDI0IHwgYnl0ZXNbaSAqIDY0ICsgaiAqIDQgKyAxXSA8PCAxNiB8IGJ5dGVzW2kgKiA2NCArIGogKiA0ICsgMl0gPDwgOCB8IGJ5dGVzW2kgKiA2NCArIGogKiA0ICsgM107XG4gICAgfVxuICB9XG5cbiAgTVtOIC0gMV1bMTRdID0gKGJ5dGVzLmxlbmd0aCAtIDEpICogOCAvIE1hdGgucG93KDIsIDMyKTtcbiAgTVtOIC0gMV1bMTRdID0gTWF0aC5mbG9vcihNW04gLSAxXVsxNF0pO1xuICBNW04gLSAxXVsxNV0gPSAoYnl0ZXMubGVuZ3RoIC0gMSkgKiA4ICYgMHhmZmZmZmZmZjtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IE47IGkrKykge1xuICAgIHZhciBXID0gbmV3IEFycmF5KDgwKTtcblxuICAgIGZvciAodmFyIHQgPSAwOyB0IDwgMTY7IHQrKykge1xuICAgICAgV1t0XSA9IE1baV1bdF07XG4gICAgfVxuXG4gICAgZm9yICh2YXIgdCA9IDE2OyB0IDwgODA7IHQrKykge1xuICAgICAgV1t0XSA9IFJPVEwoV1t0IC0gM10gXiBXW3QgLSA4XSBeIFdbdCAtIDE0XSBeIFdbdCAtIDE2XSwgMSk7XG4gICAgfVxuXG4gICAgdmFyIGEgPSBIWzBdO1xuICAgIHZhciBiID0gSFsxXTtcbiAgICB2YXIgYyA9IEhbMl07XG4gICAgdmFyIGQgPSBIWzNdO1xuICAgIHZhciBlID0gSFs0XTtcblxuICAgIGZvciAodmFyIHQgPSAwOyB0IDwgODA7IHQrKykge1xuICAgICAgdmFyIHMgPSBNYXRoLmZsb29yKHQgLyAyMCk7XG4gICAgICB2YXIgVCA9IFJPVEwoYSwgNSkgKyBmKHMsIGIsIGMsIGQpICsgZSArIEtbc10gKyBXW3RdID4+PiAwO1xuICAgICAgZSA9IGQ7XG4gICAgICBkID0gYztcbiAgICAgIGMgPSBST1RMKGIsIDMwKSA+Pj4gMDtcbiAgICAgIGIgPSBhO1xuICAgICAgYSA9IFQ7XG4gICAgfVxuXG4gICAgSFswXSA9IEhbMF0gKyBhID4+PiAwO1xuICAgIEhbMV0gPSBIWzFdICsgYiA+Pj4gMDtcbiAgICBIWzJdID0gSFsyXSArIGMgPj4+IDA7XG4gICAgSFszXSA9IEhbM10gKyBkID4+PiAwO1xuICAgIEhbNF0gPSBIWzRdICsgZSA+Pj4gMDtcbiAgfVxuXG4gIHJldHVybiBbSFswXSA+PiAyNCAmIDB4ZmYsIEhbMF0gPj4gMTYgJiAweGZmLCBIWzBdID4+IDggJiAweGZmLCBIWzBdICYgMHhmZiwgSFsxXSA+PiAyNCAmIDB4ZmYsIEhbMV0gPj4gMTYgJiAweGZmLCBIWzFdID4+IDggJiAweGZmLCBIWzFdICYgMHhmZiwgSFsyXSA+PiAyNCAmIDB4ZmYsIEhbMl0gPj4gMTYgJiAweGZmLCBIWzJdID4+IDggJiAweGZmLCBIWzJdICYgMHhmZiwgSFszXSA+PiAyNCAmIDB4ZmYsIEhbM10gPj4gMTYgJiAweGZmLCBIWzNdID4+IDggJiAweGZmLCBIWzNdICYgMHhmZiwgSFs0XSA+PiAyNCAmIDB4ZmYsIEhbNF0gPj4gMTYgJiAweGZmLCBIWzRdID4+IDggJiAweGZmLCBIWzRdICYgMHhmZl07XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNoYTE7Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./node_modules/uuid/dist/esm-browser/sha1.js\n");

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v1.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v1.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ \"./node_modules/uuid/dist/esm-browser/rng.js\");\n/* harmony import */ var _bytesToUuid_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./bytesToUuid.js */ \"./node_modules/uuid/dist/esm-browser/bytesToUuid.js\");\n\n // **`v1()` - Generate time-based UUID**\n//\n// Inspired by https://github.com/LiosK/UUID.js\n// and http://docs.python.org/library/uuid.html\n\nvar _nodeId;\n\nvar _clockseq; // Previous uuid creation time\n\n\nvar _lastMSecs = 0;\nvar _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details\n\nfunction v1(options, buf, offset) {\n  var i = buf && offset || 0;\n  var b = buf || [];\n  options = options || {};\n  var node = options.node || _nodeId;\n  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not\n  // specified.  We do this lazily to minimize issues related to insufficient\n  // system entropy.  See #189\n\n  if (node == null || clockseq == null) {\n    var seedBytes = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"])();\n\n    if (node == null) {\n      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)\n      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];\n    }\n\n    if (clockseq == null) {\n      // Per 4.2.2, randomize (14 bit) clockseq\n      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;\n    }\n  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,\n  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so\n  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'\n  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.\n\n\n  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime(); // Per 4.2.1.2, use count of uuid's generated during the current clock\n  // cycle to simulate higher resolution clock\n\n  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)\n\n  var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression\n\n  if (dt < 0 && options.clockseq === undefined) {\n    clockseq = clockseq + 1 & 0x3fff;\n  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new\n  // time interval\n\n\n  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {\n    nsecs = 0;\n  } // Per 4.2.1.2 Throw error if too many uuids are requested\n\n\n  if (nsecs >= 10000) {\n    throw new Error(\"uuid.v1(): Can't create more than 10M uuids/sec\");\n  }\n\n  _lastMSecs = msecs;\n  _lastNSecs = nsecs;\n  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch\n\n  msecs += 12219292800000; // `time_low`\n\n  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;\n  b[i++] = tl >>> 24 & 0xff;\n  b[i++] = tl >>> 16 & 0xff;\n  b[i++] = tl >>> 8 & 0xff;\n  b[i++] = tl & 0xff; // `time_mid`\n\n  var tmh = msecs / 0x100000000 * 10000 & 0xfffffff;\n  b[i++] = tmh >>> 8 & 0xff;\n  b[i++] = tmh & 0xff; // `time_high_and_version`\n\n  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version\n\n  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)\n\n  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`\n\n  b[i++] = clockseq & 0xff; // `node`\n\n  for (var n = 0; n < 6; ++n) {\n    b[i + n] = node[n];\n  }\n\n  return buf ? buf : Object(_bytesToUuid_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(b);\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (v1);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjEuanM/YzUwYSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBO0FBQUE7QUFBMkI7QUFDZ0I7QUFDM0M7QUFDQTtBQUNBOztBQUVBOztBQUVBLGNBQWM7OztBQUdkO0FBQ0EsbUJBQW1COztBQUVuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0VBQStFO0FBQy9FO0FBQ0E7O0FBRUE7QUFDQSxzREFBc0QsK0NBQUc7O0FBRXpEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7O0FBR0EsaUZBQWlGO0FBQ2pGOztBQUVBLDJFQUEyRTs7QUFFM0UsNkRBQTZEOztBQUU3RDtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7QUFHQTtBQUNBO0FBQ0EsR0FBRzs7O0FBR0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBdUI7O0FBRXZCLDBCQUEwQjs7QUFFMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7O0FBRXJCO0FBQ0E7QUFDQSxzQkFBc0I7O0FBRXRCLG1DQUFtQzs7QUFFbkMsNkJBQTZCOztBQUU3QixpQ0FBaUM7O0FBRWpDLDJCQUEyQjs7QUFFM0IsaUJBQWlCLE9BQU87QUFDeEI7QUFDQTs7QUFFQSxxQkFBcUIsK0RBQVc7QUFDaEM7O0FBRWUsaUVBQUUiLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3YxLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJuZyBmcm9tICcuL3JuZy5qcyc7XG5pbXBvcnQgYnl0ZXNUb1V1aWQgZnJvbSAnLi9ieXRlc1RvVXVpZC5qcyc7IC8vICoqYHYxKClgIC0gR2VuZXJhdGUgdGltZS1iYXNlZCBVVUlEKipcbi8vXG4vLyBJbnNwaXJlZCBieSBodHRwczovL2dpdGh1Yi5jb20vTGlvc0svVVVJRC5qc1xuLy8gYW5kIGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS91dWlkLmh0bWxcblxudmFyIF9ub2RlSWQ7XG5cbnZhciBfY2xvY2tzZXE7IC8vIFByZXZpb3VzIHV1aWQgY3JlYXRpb24gdGltZVxuXG5cbnZhciBfbGFzdE1TZWNzID0gMDtcbnZhciBfbGFzdE5TZWNzID0gMDsgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS91dWlkanMvdXVpZCBmb3IgQVBJIGRldGFpbHNcblxuZnVuY3Rpb24gdjEob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG4gIHZhciBiID0gYnVmIHx8IFtdO1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIG5vZGUgPSBvcHRpb25zLm5vZGUgfHwgX25vZGVJZDtcbiAgdmFyIGNsb2Nrc2VxID0gb3B0aW9ucy5jbG9ja3NlcSAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5jbG9ja3NlcSA6IF9jbG9ja3NlcTsgLy8gbm9kZSBhbmQgY2xvY2tzZXEgbmVlZCB0byBiZSBpbml0aWFsaXplZCB0byByYW5kb20gdmFsdWVzIGlmIHRoZXkncmUgbm90XG4gIC8vIHNwZWNpZmllZC4gIFdlIGRvIHRoaXMgbGF6aWx5IHRvIG1pbmltaXplIGlzc3VlcyByZWxhdGVkIHRvIGluc3VmZmljaWVudFxuICAvLyBzeXN0ZW0gZW50cm9weS4gIFNlZSAjMTg5XG5cbiAgaWYgKG5vZGUgPT0gbnVsbCB8fCBjbG9ja3NlcSA9PSBudWxsKSB7XG4gICAgdmFyIHNlZWRCeXRlcyA9IG9wdGlvbnMucmFuZG9tIHx8IChvcHRpb25zLnJuZyB8fCBybmcpKCk7XG5cbiAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICAvLyBQZXIgNC41LCBjcmVhdGUgYW5kIDQ4LWJpdCBub2RlIGlkLCAoNDcgcmFuZG9tIGJpdHMgKyBtdWx0aWNhc3QgYml0ID0gMSlcbiAgICAgIG5vZGUgPSBfbm9kZUlkID0gW3NlZWRCeXRlc1swXSB8IDB4MDEsIHNlZWRCeXRlc1sxXSwgc2VlZEJ5dGVzWzJdLCBzZWVkQnl0ZXNbM10sIHNlZWRCeXRlc1s0XSwgc2VlZEJ5dGVzWzVdXTtcbiAgICB9XG5cbiAgICBpZiAoY2xvY2tzZXEgPT0gbnVsbCkge1xuICAgICAgLy8gUGVyIDQuMi4yLCByYW5kb21pemUgKDE0IGJpdCkgY2xvY2tzZXFcbiAgICAgIGNsb2Nrc2VxID0gX2Nsb2Nrc2VxID0gKHNlZWRCeXRlc1s2XSA8PCA4IHwgc2VlZEJ5dGVzWzddKSAmIDB4M2ZmZjtcbiAgICB9XG4gIH0gLy8gVVVJRCB0aW1lc3RhbXBzIGFyZSAxMDAgbmFuby1zZWNvbmQgdW5pdHMgc2luY2UgdGhlIEdyZWdvcmlhbiBlcG9jaCxcbiAgLy8gKDE1ODItMTAtMTUgMDA6MDApLiAgSlNOdW1iZXJzIGFyZW4ndCBwcmVjaXNlIGVub3VnaCBmb3IgdGhpcywgc29cbiAgLy8gdGltZSBpcyBoYW5kbGVkIGludGVybmFsbHkgYXMgJ21zZWNzJyAoaW50ZWdlciBtaWxsaXNlY29uZHMpIGFuZCAnbnNlY3MnXG4gIC8vICgxMDAtbmFub3NlY29uZHMgb2Zmc2V0IGZyb20gbXNlY3MpIHNpbmNlIHVuaXggZXBvY2gsIDE5NzAtMDEtMDEgMDA6MDAuXG5cblxuICB2YXIgbXNlY3MgPSBvcHRpb25zLm1zZWNzICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLm1zZWNzIDogbmV3IERhdGUoKS5nZXRUaW1lKCk7IC8vIFBlciA0LjIuMS4yLCB1c2UgY291bnQgb2YgdXVpZCdzIGdlbmVyYXRlZCBkdXJpbmcgdGhlIGN1cnJlbnQgY2xvY2tcbiAgLy8gY3ljbGUgdG8gc2ltdWxhdGUgaGlnaGVyIHJlc29sdXRpb24gY2xvY2tcblxuICB2YXIgbnNlY3MgPSBvcHRpb25zLm5zZWNzICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLm5zZWNzIDogX2xhc3ROU2VjcyArIDE7IC8vIFRpbWUgc2luY2UgbGFzdCB1dWlkIGNyZWF0aW9uIChpbiBtc2VjcylcblxuICB2YXIgZHQgPSBtc2VjcyAtIF9sYXN0TVNlY3MgKyAobnNlY3MgLSBfbGFzdE5TZWNzKSAvIDEwMDAwOyAvLyBQZXIgNC4yLjEuMiwgQnVtcCBjbG9ja3NlcSBvbiBjbG9jayByZWdyZXNzaW9uXG5cbiAgaWYgKGR0IDwgMCAmJiBvcHRpb25zLmNsb2Nrc2VxID09PSB1bmRlZmluZWQpIHtcbiAgICBjbG9ja3NlcSA9IGNsb2Nrc2VxICsgMSAmIDB4M2ZmZjtcbiAgfSAvLyBSZXNldCBuc2VjcyBpZiBjbG9jayByZWdyZXNzZXMgKG5ldyBjbG9ja3NlcSkgb3Igd2UndmUgbW92ZWQgb250byBhIG5ld1xuICAvLyB0aW1lIGludGVydmFsXG5cblxuICBpZiAoKGR0IDwgMCB8fCBtc2VjcyA+IF9sYXN0TVNlY3MpICYmIG9wdGlvbnMubnNlY3MgPT09IHVuZGVmaW5lZCkge1xuICAgIG5zZWNzID0gMDtcbiAgfSAvLyBQZXIgNC4yLjEuMiBUaHJvdyBlcnJvciBpZiB0b28gbWFueSB1dWlkcyBhcmUgcmVxdWVzdGVkXG5cblxuICBpZiAobnNlY3MgPj0gMTAwMDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1dWlkLnYxKCk6IENhbid0IGNyZWF0ZSBtb3JlIHRoYW4gMTBNIHV1aWRzL3NlY1wiKTtcbiAgfVxuXG4gIF9sYXN0TVNlY3MgPSBtc2VjcztcbiAgX2xhc3ROU2VjcyA9IG5zZWNzO1xuICBfY2xvY2tzZXEgPSBjbG9ja3NlcTsgLy8gUGVyIDQuMS40IC0gQ29udmVydCBmcm9tIHVuaXggZXBvY2ggdG8gR3JlZ29yaWFuIGVwb2NoXG5cbiAgbXNlY3MgKz0gMTIyMTkyOTI4MDAwMDA7IC8vIGB0aW1lX2xvd2BcblxuICB2YXIgdGwgPSAoKG1zZWNzICYgMHhmZmZmZmZmKSAqIDEwMDAwICsgbnNlY3MpICUgMHgxMDAwMDAwMDA7XG4gIGJbaSsrXSA9IHRsID4+PiAyNCAmIDB4ZmY7XG4gIGJbaSsrXSA9IHRsID4+PiAxNiAmIDB4ZmY7XG4gIGJbaSsrXSA9IHRsID4+PiA4ICYgMHhmZjtcbiAgYltpKytdID0gdGwgJiAweGZmOyAvLyBgdGltZV9taWRgXG5cbiAgdmFyIHRtaCA9IG1zZWNzIC8gMHgxMDAwMDAwMDAgKiAxMDAwMCAmIDB4ZmZmZmZmZjtcbiAgYltpKytdID0gdG1oID4+PiA4ICYgMHhmZjtcbiAgYltpKytdID0gdG1oICYgMHhmZjsgLy8gYHRpbWVfaGlnaF9hbmRfdmVyc2lvbmBcblxuICBiW2krK10gPSB0bWggPj4+IDI0ICYgMHhmIHwgMHgxMDsgLy8gaW5jbHVkZSB2ZXJzaW9uXG5cbiAgYltpKytdID0gdG1oID4+PiAxNiAmIDB4ZmY7IC8vIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYCAoUGVyIDQuMi4yIC0gaW5jbHVkZSB2YXJpYW50KVxuXG4gIGJbaSsrXSA9IGNsb2Nrc2VxID4+PiA4IHwgMHg4MDsgLy8gYGNsb2NrX3NlcV9sb3dgXG5cbiAgYltpKytdID0gY2xvY2tzZXEgJiAweGZmOyAvLyBgbm9kZWBcblxuICBmb3IgKHZhciBuID0gMDsgbiA8IDY7ICsrbikge1xuICAgIGJbaSArIG5dID0gbm9kZVtuXTtcbiAgfVxuXG4gIHJldHVybiBidWYgPyBidWYgOiBieXRlc1RvVXVpZChiKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdjE7Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./node_modules/uuid/dist/esm-browser/v1.js\n");

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v3.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v3.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _v35_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./v35.js */ \"./node_modules/uuid/dist/esm-browser/v35.js\");\n/* harmony import */ var _md5_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./md5.js */ \"./node_modules/uuid/dist/esm-browser/md5.js\");\n\n\nvar v3 = Object(_v35_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"])('v3', 0x30, _md5_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"]);\n/* harmony default export */ __webpack_exports__[\"default\"] = (v3);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjMuanM/NTRhYiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBO0FBQUE7QUFBMkI7QUFDQTtBQUMzQixTQUFTLHVEQUFHLGFBQWEsK0NBQUc7QUFDYixpRUFBRSIsImZpbGUiOiIuL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjMuanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdjM1IGZyb20gJy4vdjM1LmpzJztcbmltcG9ydCBtZDUgZnJvbSAnLi9tZDUuanMnO1xudmFyIHYzID0gdjM1KCd2MycsIDB4MzAsIG1kNSk7XG5leHBvcnQgZGVmYXVsdCB2MzsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./node_modules/uuid/dist/esm-browser/v3.js\n");

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v35.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v35.js ***!
  \***************************************************/
/*! exports provided: DNS, URL, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"DNS\", function() { return DNS; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"URL\", function() { return URL; });\n/* harmony import */ var _bytesToUuid_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bytesToUuid.js */ \"./node_modules/uuid/dist/esm-browser/bytesToUuid.js\");\n\n\nfunction uuidToBytes(uuid) {\n  // Note: We assume we're being passed a valid uuid string\n  var bytes = [];\n  uuid.replace(/[a-fA-F0-9]{2}/g, function (hex) {\n    bytes.push(parseInt(hex, 16));\n  });\n  return bytes;\n}\n\nfunction stringToBytes(str) {\n  str = unescape(encodeURIComponent(str)); // UTF8 escape\n\n  var bytes = new Array(str.length);\n\n  for (var i = 0; i < str.length; i++) {\n    bytes[i] = str.charCodeAt(i);\n  }\n\n  return bytes;\n}\n\nvar DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';\nvar URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';\n/* harmony default export */ __webpack_exports__[\"default\"] = (function (name, version, hashfunc) {\n  var generateUUID = function generateUUID(value, namespace, buf, offset) {\n    var off = buf && offset || 0;\n    if (typeof value == 'string') value = stringToBytes(value);\n    if (typeof namespace == 'string') namespace = uuidToBytes(namespace);\n    if (!Array.isArray(value)) throw TypeError('value must be an array of bytes');\n    if (!Array.isArray(namespace) || namespace.length !== 16) throw TypeError('namespace must be uuid string or an Array of 16 byte values'); // Per 4.3\n\n    var bytes = hashfunc(namespace.concat(value));\n    bytes[6] = bytes[6] & 0x0f | version;\n    bytes[8] = bytes[8] & 0x3f | 0x80;\n\n    if (buf) {\n      for (var idx = 0; idx < 16; ++idx) {\n        buf[off + idx] = bytes[idx];\n      }\n    }\n\n    return buf || Object(_bytesToUuid_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(bytes);\n  }; // Function#name is not settable on some platforms (#270)\n\n\n  try {\n    generateUUID.name = name;\n  } catch (err) {} // For CommonJS default export support\n\n\n  generateUUID.DNS = DNS;\n  generateUUID.URL = URL;\n  return generateUUID;\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjM1LmpzP2ZmYzYiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQTtBQUFBO0FBQUE7QUFBMkM7O0FBRTNDO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixFQUFFO0FBQzlCO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQSwwQ0FBMEM7O0FBRTFDOztBQUVBLGlCQUFpQixnQkFBZ0I7QUFDakM7QUFDQTs7QUFFQTtBQUNBOztBQUVPO0FBQ0E7QUFDUTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2SUFBNkk7O0FBRTdJO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHVCQUF1QixVQUFVO0FBQ2pDO0FBQ0E7QUFDQTs7QUFFQSxrQkFBa0IsK0RBQVc7QUFDN0IsSUFBSTs7O0FBR0o7QUFDQTtBQUNBLEdBQUcsZUFBZTs7O0FBR2xCO0FBQ0E7QUFDQTtBQUNBLEMiLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3YzNS5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBieXRlc1RvVXVpZCBmcm9tICcuL2J5dGVzVG9VdWlkLmpzJztcblxuZnVuY3Rpb24gdXVpZFRvQnl0ZXModXVpZCkge1xuICAvLyBOb3RlOiBXZSBhc3N1bWUgd2UncmUgYmVpbmcgcGFzc2VkIGEgdmFsaWQgdXVpZCBzdHJpbmdcbiAgdmFyIGJ5dGVzID0gW107XG4gIHV1aWQucmVwbGFjZSgvW2EtZkEtRjAtOV17Mn0vZywgZnVuY3Rpb24gKGhleCkge1xuICAgIGJ5dGVzLnB1c2gocGFyc2VJbnQoaGV4LCAxNikpO1xuICB9KTtcbiAgcmV0dXJuIGJ5dGVzO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdUb0J5dGVzKHN0cikge1xuICBzdHIgPSB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoc3RyKSk7IC8vIFVURjggZXNjYXBlXG5cbiAgdmFyIGJ5dGVzID0gbmV3IEFycmF5KHN0ci5sZW5ndGgpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYnl0ZXNbaV0gPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgfVxuXG4gIHJldHVybiBieXRlcztcbn1cblxuZXhwb3J0IHZhciBETlMgPSAnNmJhN2I4MTAtOWRhZC0xMWQxLTgwYjQtMDBjMDRmZDQzMGM4JztcbmV4cG9ydCB2YXIgVVJMID0gJzZiYTdiODExLTlkYWQtMTFkMS04MGI0LTAwYzA0ZmQ0MzBjOCc7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAobmFtZSwgdmVyc2lvbiwgaGFzaGZ1bmMpIHtcbiAgdmFyIGdlbmVyYXRlVVVJRCA9IGZ1bmN0aW9uIGdlbmVyYXRlVVVJRCh2YWx1ZSwgbmFtZXNwYWNlLCBidWYsIG9mZnNldCkge1xuICAgIHZhciBvZmYgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJykgdmFsdWUgPSBzdHJpbmdUb0J5dGVzKHZhbHVlKTtcbiAgICBpZiAodHlwZW9mIG5hbWVzcGFjZSA9PSAnc3RyaW5nJykgbmFtZXNwYWNlID0gdXVpZFRvQnl0ZXMobmFtZXNwYWNlKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKSB0aHJvdyBUeXBlRXJyb3IoJ3ZhbHVlIG11c3QgYmUgYW4gYXJyYXkgb2YgYnl0ZXMnKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkobmFtZXNwYWNlKSB8fCBuYW1lc3BhY2UubGVuZ3RoICE9PSAxNikgdGhyb3cgVHlwZUVycm9yKCduYW1lc3BhY2UgbXVzdCBiZSB1dWlkIHN0cmluZyBvciBhbiBBcnJheSBvZiAxNiBieXRlIHZhbHVlcycpOyAvLyBQZXIgNC4zXG5cbiAgICB2YXIgYnl0ZXMgPSBoYXNoZnVuYyhuYW1lc3BhY2UuY29uY2F0KHZhbHVlKSk7XG4gICAgYnl0ZXNbNl0gPSBieXRlc1s2XSAmIDB4MGYgfCB2ZXJzaW9uO1xuICAgIGJ5dGVzWzhdID0gYnl0ZXNbOF0gJiAweDNmIHwgMHg4MDtcblxuICAgIGlmIChidWYpIHtcbiAgICAgIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IDE2OyArK2lkeCkge1xuICAgICAgICBidWZbb2ZmICsgaWR4XSA9IGJ5dGVzW2lkeF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZiB8fCBieXRlc1RvVXVpZChieXRlcyk7XG4gIH07IC8vIEZ1bmN0aW9uI25hbWUgaXMgbm90IHNldHRhYmxlIG9uIHNvbWUgcGxhdGZvcm1zICgjMjcwKVxuXG5cbiAgdHJ5IHtcbiAgICBnZW5lcmF0ZVVVSUQubmFtZSA9IG5hbWU7XG4gIH0gY2F0Y2ggKGVycikge30gLy8gRm9yIENvbW1vbkpTIGRlZmF1bHQgZXhwb3J0IHN1cHBvcnRcblxuXG4gIGdlbmVyYXRlVVVJRC5ETlMgPSBETlM7XG4gIGdlbmVyYXRlVVVJRC5VUkwgPSBVUkw7XG4gIHJldHVybiBnZW5lcmF0ZVVVSUQ7XG59Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./node_modules/uuid/dist/esm-browser/v35.js\n");

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v4.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v4.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ \"./node_modules/uuid/dist/esm-browser/rng.js\");\n/* harmony import */ var _bytesToUuid_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./bytesToUuid.js */ \"./node_modules/uuid/dist/esm-browser/bytesToUuid.js\");\n\n\n\nfunction v4(options, buf, offset) {\n  var i = buf && offset || 0;\n\n  if (typeof options == 'string') {\n    buf = options === 'binary' ? new Array(16) : null;\n    options = null;\n  }\n\n  options = options || {};\n  var rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`\n\n  rnds[6] = rnds[6] & 0x0f | 0x40;\n  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided\n\n  if (buf) {\n    for (var ii = 0; ii < 16; ++ii) {\n      buf[i + ii] = rnds[ii];\n    }\n  }\n\n  return buf || Object(_bytesToUuid_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(rnds);\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (v4);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjQuanM/ZWMyNiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBO0FBQUE7QUFBMkI7QUFDZ0I7O0FBRTNDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwrQ0FBK0MsK0NBQUcsSUFBSTs7QUFFdEQ7QUFDQSxrQ0FBa0M7O0FBRWxDO0FBQ0Esb0JBQW9CLFNBQVM7QUFDN0I7QUFDQTtBQUNBOztBQUVBLGdCQUFnQiwrREFBVztBQUMzQjs7QUFFZSxpRUFBRSIsImZpbGUiOiIuL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjQuanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcm5nIGZyb20gJy4vcm5nLmpzJztcbmltcG9ydCBieXRlc1RvVXVpZCBmcm9tICcuL2J5dGVzVG9VdWlkLmpzJztcblxuZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG5cbiAgaWYgKHR5cGVvZiBvcHRpb25zID09ICdzdHJpbmcnKSB7XG4gICAgYnVmID0gb3B0aW9ucyA9PT0gJ2JpbmFyeScgPyBuZXcgQXJyYXkoMTYpIDogbnVsbDtcbiAgICBvcHRpb25zID0gbnVsbDtcbiAgfVxuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgcm5kcyA9IG9wdGlvbnMucmFuZG9tIHx8IChvcHRpb25zLnJuZyB8fCBybmcpKCk7IC8vIFBlciA0LjQsIHNldCBiaXRzIGZvciB2ZXJzaW9uIGFuZCBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGBcblxuICBybmRzWzZdID0gcm5kc1s2XSAmIDB4MGYgfCAweDQwO1xuICBybmRzWzhdID0gcm5kc1s4XSAmIDB4M2YgfCAweDgwOyAvLyBDb3B5IGJ5dGVzIHRvIGJ1ZmZlciwgaWYgcHJvdmlkZWRcblxuICBpZiAoYnVmKSB7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IDE2OyArK2lpKSB7XG4gICAgICBidWZbaSArIGlpXSA9IHJuZHNbaWldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWYgfHwgYnl0ZXNUb1V1aWQocm5kcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHY0OyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./node_modules/uuid/dist/esm-browser/v4.js\n");

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v5.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v5.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _v35_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./v35.js */ \"./node_modules/uuid/dist/esm-browser/v35.js\");\n/* harmony import */ var _sha1_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./sha1.js */ \"./node_modules/uuid/dist/esm-browser/sha1.js\");\n\n\nvar v5 = Object(_v35_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"])('v5', 0x50, _sha1_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"]);\n/* harmony default export */ __webpack_exports__[\"default\"] = (v5);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjUuanM/MjZiZiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBO0FBQUE7QUFBMkI7QUFDRTtBQUM3QixTQUFTLHVEQUFHLGFBQWEsZ0RBQUk7QUFDZCxpRUFBRSIsImZpbGUiOiIuL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjUuanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdjM1IGZyb20gJy4vdjM1LmpzJztcbmltcG9ydCBzaGExIGZyb20gJy4vc2hhMS5qcyc7XG52YXIgdjUgPSB2MzUoJ3Y1JywgMHg1MCwgc2hhMSk7XG5leHBvcnQgZGVmYXVsdCB2NTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./node_modules/uuid/dist/esm-browser/v5.js\n");

/***/ }),

/***/ "./src/ComponentCollection.ts":
/*!************************************!*\
  !*** ./src/ComponentCollection.ts ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return ComponentCollection; });\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\nclass ComponentCollection {\n  constructor() {\n    _defineProperty(this, \"components\", new Map());\n\n    _defineProperty(this, \"add\", component => {\n      this.components.set(component.type, component);\n    });\n\n    _defineProperty(this, \"update\", (cType, func) => {\n      if (this.components.has(cType)) {\n        const c = this.components.get(cType);\n\n        if (c) {\n          const updatedComponent = func(c);\n          this.components.set(cType, updatedComponent);\n        }\n      }\n    });\n\n    _defineProperty(this, \"get\", cType => {\n      if (!this.components.has(cType)) {\n        throw new Error(`ComponentCollection does not have component of type ${cType}`);\n      }\n\n      return this.components.get(cType);\n    });\n\n    _defineProperty(this, \"has\", cType => {\n      if (Array.isArray(cType)) {\n        return cType.every(ct => this.components.has(ct) === true);\n      } else {\n        return this.components.has(cType);\n      }\n    });\n  }\n\n  get size() {\n    return this.components.size;\n  }\n\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL3NyYy9Db21wb25lbnRDb2xsZWN0aW9uLnRzPzUxYzQiXSwibmFtZXMiOlsiQ29tcG9uZW50Q29sbGVjdGlvbiIsIk1hcCIsImNvbXBvbmVudCIsImNvbXBvbmVudHMiLCJzZXQiLCJ0eXBlIiwiY1R5cGUiLCJmdW5jIiwiaGFzIiwiYyIsImdldCIsInVwZGF0ZWRDb21wb25lbnQiLCJFcnJvciIsIkFycmF5IiwiaXNBcnJheSIsImV2ZXJ5IiwiY3QiLCJzaXplIl0sIm1hcHBpbmdzIjoiOzs7O0FBRWUsTUFBTUEsbUJBQU4sQ0FBOEI7QUFBQTtBQUFBLHdDQUNFLElBQUlDLEdBQUosRUFERjs7QUFBQSxpQ0FHcENDLFNBQUQsSUFBb0M7QUFDeEMsV0FBS0MsVUFBTCxDQUFnQkMsR0FBaEIsQ0FBb0JGLFNBQVMsQ0FBQ0csSUFBOUIsRUFBb0NILFNBQXBDO0FBQ0QsS0FMMEM7O0FBQUEsb0NBT2xDLENBQUNJLEtBQUQsRUFBWUMsSUFBWixLQUFnRTtBQUN2RSxVQUFJLEtBQUtKLFVBQUwsQ0FBZ0JLLEdBQWhCLENBQW9CRixLQUFwQixDQUFKLEVBQWdDO0FBQzlCLGNBQU1HLENBQUMsR0FBRyxLQUFLTixVQUFMLENBQWdCTyxHQUFoQixDQUFvQkosS0FBcEIsQ0FBVjs7QUFFQSxZQUFJRyxDQUFKLEVBQU87QUFDTCxnQkFBTUUsZ0JBQWdCLEdBQUdKLElBQUksQ0FBQ0UsQ0FBRCxDQUE3QjtBQUNBLGVBQUtOLFVBQUwsQ0FBZ0JDLEdBQWhCLENBQW9CRSxLQUFwQixFQUEyQkssZ0JBQTNCO0FBQ0Q7QUFDRjtBQUNGLEtBaEIwQzs7QUFBQSxpQ0FrQmpDTCxLQUFKLElBQXFCO0FBQ3pCLFVBQUksQ0FBQyxLQUFLSCxVQUFMLENBQWdCSyxHQUFoQixDQUFvQkYsS0FBcEIsQ0FBTCxFQUFpQztBQUMvQixjQUFNLElBQUlNLEtBQUosQ0FBVyx1REFBc0ROLEtBQU0sRUFBdkUsQ0FBTjtBQUNEOztBQUVELGFBQU8sS0FBS0gsVUFBTCxDQUFnQk8sR0FBaEIsQ0FBb0JKLEtBQXBCLENBQVA7QUFDRCxLQXhCMEM7O0FBQUEsaUNBMEJwQ0EsS0FBRCxJQUErQjtBQUNuQyxVQUFJTyxLQUFLLENBQUNDLE9BQU4sQ0FBY1IsS0FBZCxDQUFKLEVBQTBCO0FBQ3hCLGVBQU9BLEtBQUssQ0FBQ1MsS0FBTixDQUFhQyxFQUFELElBQVEsS0FBS2IsVUFBTCxDQUFnQkssR0FBaEIsQ0FBb0JRLEVBQXBCLE1BQTRCLElBQWhELENBQVA7QUFDRCxPQUZELE1BRU87QUFDTCxlQUFPLEtBQUtiLFVBQUwsQ0FBZ0JLLEdBQWhCLENBQW9CRixLQUFwQixDQUFQO0FBQ0Q7QUFDRixLQWhDMEM7QUFBQTs7QUFrQzNDLE1BQUlXLElBQUosR0FBbUI7QUFDakIsV0FBTyxLQUFLZCxVQUFMLENBQWdCYyxJQUF2QjtBQUNEOztBQXBDMEMiLCJmaWxlIjoiLi9zcmMvQ29tcG9uZW50Q29sbGVjdGlvbi50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4vQ29tcG9uZW50JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcG9uZW50Q29sbGVjdGlvbjxDVD4ge1xuICBwcml2YXRlIGNvbXBvbmVudHM6IE1hcDxDVCwgQ29tcG9uZW50PENUPj4gPSBuZXcgTWFwKCk7XG5cbiAgYWRkID0gKGNvbXBvbmVudDogQ29tcG9uZW50PENUPik6IHZvaWQgPT4ge1xuICAgIHRoaXMuY29tcG9uZW50cy5zZXQoY29tcG9uZW50LnR5cGUsIGNvbXBvbmVudCk7XG4gIH1cblxuICB1cGRhdGUgPSAoY1R5cGU6IENULCBmdW5jOiAoYzogQ29tcG9uZW50PENUPikgPT4gQ29tcG9uZW50PENUPik6IHZvaWQgPT4ge1xuICAgIGlmICh0aGlzLmNvbXBvbmVudHMuaGFzKGNUeXBlKSkge1xuICAgICAgY29uc3QgYyA9IHRoaXMuY29tcG9uZW50cy5nZXQoY1R5cGUpO1xuXG4gICAgICBpZiAoYykge1xuICAgICAgICBjb25zdCB1cGRhdGVkQ29tcG9uZW50ID0gZnVuYyhjKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzLnNldChjVHlwZSwgdXBkYXRlZENvbXBvbmVudCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGdldCA9IDxDPihjVHlwZTogQ1QpOiBDID0+IHtcbiAgICBpZiAoIXRoaXMuY29tcG9uZW50cy5oYXMoY1R5cGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbXBvbmVudENvbGxlY3Rpb24gZG9lcyBub3QgaGF2ZSBjb21wb25lbnQgb2YgdHlwZSAke2NUeXBlfWApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMuZ2V0KGNUeXBlKSBhcyB1bmtub3duIGFzIEM7XG4gIH1cblxuICBoYXMgPSAoY1R5cGU6IENUIHwgQ1RbXSk6IGJvb2xlYW4gPT4ge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGNUeXBlKSkge1xuICAgICAgcmV0dXJuIGNUeXBlLmV2ZXJ5KChjdCkgPT4gdGhpcy5jb21wb25lbnRzLmhhcyhjdCkgPT09IHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLmhhcyhjVHlwZSlcbiAgICB9XG4gIH1cblxuICBnZXQgc2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMuc2l6ZTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/ComponentCollection.ts\n");

/***/ }),

/***/ "./src/Entity.ts":
/*!***********************!*\
  !*** ./src/Entity.ts ***!
  \***********************/
/*! exports provided: default, createEntity */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Entity; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createEntity\", function() { return createEntity; });\n/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! uuid */ \"./node_modules/uuid/dist/esm-browser/index.js\");\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n\nclass Entity {\n  constructor(world) {\n    _defineProperty(this, \"id\", void 0);\n\n    _defineProperty(this, \"world\", void 0);\n\n    this.id = Object(uuid__WEBPACK_IMPORTED_MODULE_0__[\"v4\"])();\n    this.world = world;\n    /*\n    Registering with the World.\n    */\n\n    this.world.registerEntity(this);\n  }\n\n  add(component) {\n    this.world.set(this.id, component);\n    return this;\n  } // TODO: figure out some much better error handling throughout this library.\n  //       Probably throw some errors.\n\n\n  get(cType) {\n    const cc = this.world.entities.get(this.id);\n\n    if (!cc) {\n      console.error('unable to find component collection for specified entity: ', this.id);\n    }\n\n    const component = cc.get(cType);\n\n    if (!component) {\n      console.error(`Unable to find component of type ${cType} in entity ${this.id}`);\n    }\n\n    return component;\n  }\n\n  getAll() {\n    return this.world.componentCollections.get(this.id);\n  }\n\n  get components() {\n    return this.world.componentCollections.get(this.id);\n  }\n  /** Clears all components from an Entity */\n\n\n  clear() {\n    this.world.clearEntityComponents(this.id);\n    return this;\n  }\n\n  destroy() {\n    this.world.destroyEntity(this.id);\n  }\n\n}\nfunction createEntity(world) {\n  const entity = new Entity(world);\n  return entity;\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL3NyYy9FbnRpdHkudHM/YWM2OCJdLCJuYW1lcyI6WyJFbnRpdHkiLCJjb25zdHJ1Y3RvciIsIndvcmxkIiwiaWQiLCJ1dWlkdjQiLCJyZWdpc3RlckVudGl0eSIsImFkZCIsImNvbXBvbmVudCIsInNldCIsImdldCIsImNUeXBlIiwiY2MiLCJlbnRpdGllcyIsImNvbnNvbGUiLCJlcnJvciIsImdldEFsbCIsImNvbXBvbmVudENvbGxlY3Rpb25zIiwiY29tcG9uZW50cyIsImNsZWFyIiwiY2xlYXJFbnRpdHlDb21wb25lbnRzIiwiZGVzdHJveSIsImRlc3Ryb3lFbnRpdHkiLCJjcmVhdGVFbnRpdHkiLCJlbnRpdHkiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBT2UsTUFBTUEsTUFBTixDQUFpQjtBQUk5QkMsYUFBVyxDQUFDQyxLQUFELEVBQW1CO0FBQUE7O0FBQUE7O0FBQzVCLFNBQUtDLEVBQUwsR0FBVUMsK0NBQU0sRUFBaEI7QUFDQSxTQUFLRixLQUFMLEdBQWFBLEtBQWI7QUFFQTs7OztBQUdBLFNBQUtBLEtBQUwsQ0FBV0csY0FBWCxDQUEwQixJQUExQjtBQUNEOztBQUVEQyxLQUFHLENBQUNDLFNBQUQsRUFBdUM7QUFDeEMsU0FBS0wsS0FBTCxDQUFXTSxHQUFYLENBQWUsS0FBS0wsRUFBcEIsRUFBd0JJLFNBQXhCO0FBRUEsV0FBTyxJQUFQO0FBQ0QsR0FsQjZCLENBb0I5QjtBQUNBOzs7QUFDQUUsS0FBRyxDQUFDQyxLQUFELEVBQTJCO0FBQzVCLFVBQU1DLEVBQUUsR0FBRyxLQUFLVCxLQUFMLENBQVdVLFFBQVgsQ0FBb0JILEdBQXBCLENBQXdCLEtBQUtOLEVBQTdCLENBQVg7O0FBRUEsUUFBSSxDQUFDUSxFQUFMLEVBQVM7QUFDUEUsYUFBTyxDQUFDQyxLQUFSLENBQWMsNERBQWQsRUFBNEUsS0FBS1gsRUFBakY7QUFDRDs7QUFFRCxVQUFNSSxTQUFTLEdBQUdJLEVBQUUsQ0FBQ0YsR0FBSCxDQUFPQyxLQUFQLENBQWxCOztBQUVBLFFBQUksQ0FBQ0gsU0FBTCxFQUFnQjtBQUNkTSxhQUFPLENBQUNDLEtBQVIsQ0FBZSxvQ0FBbUNKLEtBQU0sY0FBYSxLQUFLUCxFQUFHLEVBQTdFO0FBQ0Q7O0FBR0QsV0FBT0ksU0FBUDtBQUNEOztBQUVEUSxRQUFNLEdBQTRCO0FBQ2hDLFdBQU8sS0FBS2IsS0FBTCxDQUFXYyxvQkFBWCxDQUFnQ1AsR0FBaEMsQ0FBb0MsS0FBS04sRUFBekMsQ0FBUDtBQUNEOztBQUVELE1BQUljLFVBQUosR0FBMEM7QUFDeEMsV0FBTyxLQUFLZixLQUFMLENBQVdjLG9CQUFYLENBQWdDUCxHQUFoQyxDQUFvQyxLQUFLTixFQUF6QyxDQUFQO0FBQ0Q7QUFFRDs7O0FBQ0FlLE9BQUssR0FBZTtBQUNsQixTQUFLaEIsS0FBTCxDQUFXaUIscUJBQVgsQ0FBaUMsS0FBS2hCLEVBQXRDO0FBRUEsV0FBTyxJQUFQO0FBQ0Q7O0FBRURpQixTQUFPLEdBQVM7QUFDZCxTQUFLbEIsS0FBTCxDQUFXbUIsYUFBWCxDQUF5QixLQUFLbEIsRUFBOUI7QUFDRDs7QUF4RDZCO0FBMkR6QixTQUFTbUIsWUFBVCxDQUNMcEIsS0FESyxFQUVPO0FBQ1osUUFBTXFCLE1BQU0sR0FBRyxJQUFJdkIsTUFBSixDQUFlRSxLQUFmLENBQWY7QUFFQSxTQUFPcUIsTUFBUDtBQUNEIiwiZmlsZSI6Ii4vc3JjL0VudGl0eS50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHY0IGFzIHV1aWR2NCB9IGZyb20gJ3V1aWQnO1xuaW1wb3J0IFdvcmxkIGZyb20gJy4vV29ybGQnO1xuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IENvbXBvbmVudENvbGxlY3Rpb24gZnJvbSAnLi9Db21wb25lbnRDb2xsZWN0aW9uJztcblxuZXhwb3J0IHR5cGUgRW50aXR5SWQgPSBzdHJpbmc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVudGl0eTxDVD4ge1xuICBpZDogc3RyaW5nO1xuICB3b3JsZDogV29ybGQ8Q1Q+O1xuXG4gIGNvbnN0cnVjdG9yKHdvcmxkOiBXb3JsZDxDVD4pIHtcbiAgICB0aGlzLmlkID0gdXVpZHY0KCk7XG4gICAgdGhpcy53b3JsZCA9IHdvcmxkO1xuXG4gICAgLypcbiAgICBSZWdpc3RlcmluZyB3aXRoIHRoZSBXb3JsZC5cbiAgICAqL1xuICAgIHRoaXMud29ybGQucmVnaXN0ZXJFbnRpdHkodGhpcyk7XG4gIH1cblxuICBhZGQoY29tcG9uZW50OiBDb21wb25lbnQ8Q1Q+KTogRW50aXR5PENUPiB7XG4gICAgdGhpcy53b3JsZC5zZXQodGhpcy5pZCwgY29tcG9uZW50KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gVE9ETzogZmlndXJlIG91dCBzb21lIG11Y2ggYmV0dGVyIGVycm9yIGhhbmRsaW5nIHRocm91Z2hvdXQgdGhpcyBsaWJyYXJ5LlxuICAvLyAgICAgICBQcm9iYWJseSB0aHJvdyBzb21lIGVycm9ycy5cbiAgZ2V0KGNUeXBlOiBDVCk6IENvbXBvbmVudDxDVD4ge1xuICAgIGNvbnN0IGNjID0gdGhpcy53b3JsZC5lbnRpdGllcy5nZXQodGhpcy5pZCk7XG5cbiAgICBpZiAoIWNjKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCd1bmFibGUgdG8gZmluZCBjb21wb25lbnQgY29sbGVjdGlvbiBmb3Igc3BlY2lmaWVkIGVudGl0eTogJywgdGhpcy5pZCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29tcG9uZW50ID0gY2MuZ2V0KGNUeXBlKVxuXG4gICAgaWYgKCFjb21wb25lbnQpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYFVuYWJsZSB0byBmaW5kIGNvbXBvbmVudCBvZiB0eXBlICR7Y1R5cGV9IGluIGVudGl0eSAke3RoaXMuaWR9YCk7XG4gICAgfVxuXG5cbiAgICByZXR1cm4gY29tcG9uZW50O1xuICB9XG5cbiAgZ2V0QWxsKCk6IENvbXBvbmVudENvbGxlY3Rpb248Q1Q+IHtcbiAgICByZXR1cm4gdGhpcy53b3JsZC5jb21wb25lbnRDb2xsZWN0aW9ucy5nZXQodGhpcy5pZCk7XG4gIH1cblxuICBnZXQgY29tcG9uZW50cygpOiBDb21wb25lbnRDb2xsZWN0aW9uPENUPiB7XG4gICAgcmV0dXJuIHRoaXMud29ybGQuY29tcG9uZW50Q29sbGVjdGlvbnMuZ2V0KHRoaXMuaWQpO1xuICB9XG5cbiAgLyoqIENsZWFycyBhbGwgY29tcG9uZW50cyBmcm9tIGFuIEVudGl0eSAqL1xuICBjbGVhcigpOiBFbnRpdHk8Q1Q+IHtcbiAgICB0aGlzLndvcmxkLmNsZWFyRW50aXR5Q29tcG9uZW50cyh0aGlzLmlkKTtcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMud29ybGQuZGVzdHJveUVudGl0eSh0aGlzLmlkKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRW50aXR5PENUPihcbiAgd29ybGQ6IFdvcmxkPENUPixcbik6IEVudGl0eTxDVD4ge1xuICBjb25zdCBlbnRpdHkgPSBuZXcgRW50aXR5PENUPih3b3JsZCk7XG5cbiAgcmV0dXJuIGVudGl0eTtcbn1cblxuXG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/Entity.ts\n");

/***/ }),

/***/ "./src/System.ts":
/*!***********************!*\
  !*** ./src/System.ts ***!
  \***********************/
/*! exports provided: createSystem */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createSystem\", function() { return createSystem; });\nfunction createSystem(world, cTypes, systemFunc) {\n  world.registerSystem(cTypes);\n  return () => {\n    let index = 0;\n    const size = world.entitiesByCTypes.size; // Used for matching the array of ComponentTypes which is the key\n    // of where the ComponentCollection is, with the array of ComponentTypes\n    // that are passes.\n    // Might be nice in the future to go back to a ref check on cTypes, but\n    // for now this doesn't seem to be that much of a perf hit.\n    // for (const ct of world.entitiesByCTypes.keys()) {\n    //   if (cTypes.length === ct.length && cTypes.every(c => ct.includes(c))) {\n    //     for (const eid of world.entitiesByCTypes.get(cTypes)) {\n    //       const args: SystemFuncArgs<CT> = {\n    //         entity: world.entities.get(eid),\n    //         components: world.componentCollections.get(eid),\n    //         world,\n    //         index,\n    //         size,\n    //         isFirst: index === 0,\n    //         isLast: index + 1 === size,\n    //       }\n    //       systemFunc(args);\n    //       index += 1;\n    //     }\n    //   }\n    // }\n\n    for (const eid of world.entitiesByCTypes.get(cTypes)) {\n      const args = {\n        entity: world.entities.get(eid),\n        components: world.componentCollections.get(eid),\n        world,\n        index,\n        size,\n        isFirst: index === 0,\n        isLast: index + 1 === size\n      };\n      systemFunc(args);\n      index += 1;\n    }\n  };\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL3NyYy9TeXN0ZW0udHM/MzI0OCJdLCJuYW1lcyI6WyJjcmVhdGVTeXN0ZW0iLCJ3b3JsZCIsImNUeXBlcyIsInN5c3RlbUZ1bmMiLCJyZWdpc3RlclN5c3RlbSIsImluZGV4Iiwic2l6ZSIsImVudGl0aWVzQnlDVHlwZXMiLCJlaWQiLCJnZXQiLCJhcmdzIiwiZW50aXR5IiwiZW50aXRpZXMiLCJjb21wb25lbnRzIiwiY29tcG9uZW50Q29sbGVjdGlvbnMiLCJpc0ZpcnN0IiwiaXNMYXN0Il0sIm1hcHBpbmdzIjoiQUFvQkE7QUFBQTtBQUFPLFNBQVNBLFlBQVQsQ0FDTEMsS0FESyxFQUVMQyxNQUZLLEVBR0xDLFVBSEssRUFJRztBQUNSRixPQUFLLENBQUNHLGNBQU4sQ0FBcUJGLE1BQXJCO0FBRUEsU0FBTyxNQUFZO0FBQ2pCLFFBQUlHLEtBQUssR0FBRyxDQUFaO0FBQ0EsVUFBTUMsSUFBSSxHQUFHTCxLQUFLLENBQUNNLGdCQUFOLENBQXVCRCxJQUFwQyxDQUZpQixDQUlqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFDQSxTQUFLLE1BQU1FLEdBQVgsSUFBa0JQLEtBQUssQ0FBQ00sZ0JBQU4sQ0FBdUJFLEdBQXZCLENBQTJCUCxNQUEzQixDQUFsQixFQUFzRDtBQUNwRCxZQUFNUSxJQUF3QixHQUFHO0FBQy9CQyxjQUFNLEVBQUVWLEtBQUssQ0FBQ1csUUFBTixDQUFlSCxHQUFmLENBQW1CRCxHQUFuQixDQUR1QjtBQUUvQkssa0JBQVUsRUFBRVosS0FBSyxDQUFDYSxvQkFBTixDQUEyQkwsR0FBM0IsQ0FBK0JELEdBQS9CLENBRm1CO0FBRy9CUCxhQUgrQjtBQUkvQkksYUFKK0I7QUFLL0JDLFlBTCtCO0FBTS9CUyxlQUFPLEVBQUVWLEtBQUssS0FBSyxDQU5ZO0FBTy9CVyxjQUFNLEVBQUVYLEtBQUssR0FBRyxDQUFSLEtBQWNDO0FBUFMsT0FBakM7QUFVQUgsZ0JBQVUsQ0FBQ08sSUFBRCxDQUFWO0FBRUFMLFdBQUssSUFBSSxDQUFUO0FBQ0Q7QUFDRixHQTNDRDtBQTRDRCIsImZpbGUiOiIuL3NyYy9TeXN0ZW0udHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgV29ybGQgZnJvbSAnLi9Xb3JsZCc7XG5pbXBvcnQgRW50aXR5IGZyb20gJy4vRW50aXR5JztcbmltcG9ydCBDb21wb25lbnRDb2xsZWN0aW9uIGZyb20gJy4vQ29tcG9uZW50Q29sbGVjdGlvbic7XG5cbmV4cG9ydCB0eXBlIFN5c3RlbSA9ICgpID0+IHZvaWQ7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3lzdGVtRnVuY0FyZ3M8Q1Q+IHtcbiAgZW50aXR5OiBFbnRpdHk8Q1Q+O1xuICBjb21wb25lbnRzOiBDb21wb25lbnRDb2xsZWN0aW9uPENUPjtcbiAgd29ybGQ6IFdvcmxkPENUPjtcbiAgaW5kZXg6IG51bWJlcjtcbiAgc2l6ZTogbnVtYmVyO1xuICBpc0ZpcnN0OiBib29sZWFuO1xuICBpc0xhc3Q6IGJvb2xlYW47XG59XG5cbmV4cG9ydCB0eXBlIFN5c3RlbUZ1bmM8Q1Q+ID0gKFxuICBzeXRlbUZ1bmNBcmdzOiBTeXN0ZW1GdW5jQXJnczxDVD4sXG4pID0+IHZvaWQ7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTeXN0ZW08Q1Q+KFxuICB3b3JsZDogV29ybGQ8Q1Q+LFxuICBjVHlwZXM6IENUW10sXG4gIHN5c3RlbUZ1bmM6IFN5c3RlbUZ1bmM8Q1Q+XG4pOiBTeXN0ZW0ge1xuICB3b3JsZC5yZWdpc3RlclN5c3RlbShjVHlwZXMpO1xuXG4gIHJldHVybiAoKTogdm9pZCA9PiB7XG4gICAgbGV0IGluZGV4ID0gMDtcbiAgICBjb25zdCBzaXplID0gd29ybGQuZW50aXRpZXNCeUNUeXBlcy5zaXplO1xuXG4gICAgLy8gVXNlZCBmb3IgbWF0Y2hpbmcgdGhlIGFycmF5IG9mIENvbXBvbmVudFR5cGVzIHdoaWNoIGlzIHRoZSBrZXlcbiAgICAvLyBvZiB3aGVyZSB0aGUgQ29tcG9uZW50Q29sbGVjdGlvbiBpcywgd2l0aCB0aGUgYXJyYXkgb2YgQ29tcG9uZW50VHlwZXNcbiAgICAvLyB0aGF0IGFyZSBwYXNzZXMuXG4gICAgLy8gTWlnaHQgYmUgbmljZSBpbiB0aGUgZnV0dXJlIHRvIGdvIGJhY2sgdG8gYSByZWYgY2hlY2sgb24gY1R5cGVzLCBidXRcbiAgICAvLyBmb3Igbm93IHRoaXMgZG9lc24ndCBzZWVtIHRvIGJlIHRoYXQgbXVjaCBvZiBhIHBlcmYgaGl0LlxuICAgIC8vIGZvciAoY29uc3QgY3Qgb2Ygd29ybGQuZW50aXRpZXNCeUNUeXBlcy5rZXlzKCkpIHtcbiAgICAvLyAgIGlmIChjVHlwZXMubGVuZ3RoID09PSBjdC5sZW5ndGggJiYgY1R5cGVzLmV2ZXJ5KGMgPT4gY3QuaW5jbHVkZXMoYykpKSB7XG4gICAgLy8gICAgIGZvciAoY29uc3QgZWlkIG9mIHdvcmxkLmVudGl0aWVzQnlDVHlwZXMuZ2V0KGNUeXBlcykpIHtcbiAgICAvLyAgICAgICBjb25zdCBhcmdzOiBTeXN0ZW1GdW5jQXJnczxDVD4gPSB7XG4gICAgLy8gICAgICAgICBlbnRpdHk6IHdvcmxkLmVudGl0aWVzLmdldChlaWQpLFxuICAgIC8vICAgICAgICAgY29tcG9uZW50czogd29ybGQuY29tcG9uZW50Q29sbGVjdGlvbnMuZ2V0KGVpZCksXG4gICAgLy8gICAgICAgICB3b3JsZCxcbiAgICAvLyAgICAgICAgIGluZGV4LFxuICAgIC8vICAgICAgICAgc2l6ZSxcbiAgICAvLyAgICAgICAgIGlzRmlyc3Q6IGluZGV4ID09PSAwLFxuICAgIC8vICAgICAgICAgaXNMYXN0OiBpbmRleCArIDEgPT09IHNpemUsXG4gICAgLy8gICAgICAgfVxuICAgIFxuICAgIC8vICAgICAgIHN5c3RlbUZ1bmMoYXJncyk7XG4gICAgXG4gICAgLy8gICAgICAgaW5kZXggKz0gMTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfVxuICAgIC8vIH1cbiAgICBmb3IgKGNvbnN0IGVpZCBvZiB3b3JsZC5lbnRpdGllc0J5Q1R5cGVzLmdldChjVHlwZXMpKSB7XG4gICAgICBjb25zdCBhcmdzOiBTeXN0ZW1GdW5jQXJnczxDVD4gPSB7XG4gICAgICAgIGVudGl0eTogd29ybGQuZW50aXRpZXMuZ2V0KGVpZCksXG4gICAgICAgIGNvbXBvbmVudHM6IHdvcmxkLmNvbXBvbmVudENvbGxlY3Rpb25zLmdldChlaWQpLFxuICAgICAgICB3b3JsZCxcbiAgICAgICAgaW5kZXgsXG4gICAgICAgIHNpemUsXG4gICAgICAgIGlzRmlyc3Q6IGluZGV4ID09PSAwLFxuICAgICAgICBpc0xhc3Q6IGluZGV4ICsgMSA9PT0gc2l6ZSxcbiAgICAgIH1cblxuICAgICAgc3lzdGVtRnVuYyhhcmdzKTtcblxuICAgICAgaW5kZXggKz0gMTtcbiAgICB9XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/System.ts\n");

/***/ }),

/***/ "./src/World.ts":
/*!**********************!*\
  !*** ./src/World.ts ***!
  \**********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return World; });\n/* harmony import */ var _ComponentCollection__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ComponentCollection */ \"./src/ComponentCollection.ts\");\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n\nclass World {\n  constructor() {\n    _defineProperty(this, \"componentCollections\", new Map());\n\n    _defineProperty(this, \"entities\", new Map());\n\n    _defineProperty(this, \"entitiesByCTypes\", new Map());\n\n    _defineProperty(this, \"find\", predicate => {\n      for (const entity of this.entities.values()) {\n        if (predicate(entity)) {\n          return entity;\n        }\n      }\n\n      return null;\n    });\n\n    _defineProperty(this, \"findAll\", predicate => {\n      const results = [];\n\n      for (const entity of this.entities.values()) {\n        if (predicate(entity)) {\n          results.push(entity);\n        }\n      }\n\n      return results;\n    });\n\n    _defineProperty(this, \"locate\", cTypes => {\n      for (const entity of this.entities.values()) {\n        if (entity.components.has(cTypes)) {\n          return entity;\n        }\n      }\n\n      return null;\n    });\n\n    _defineProperty(this, \"locateAll\", cTypes => {\n      const results = [];\n\n      for (const entity of this.entities.values()) {\n        if (entity.components.has(cTypes)) {\n          results.push(entity);\n        }\n      }\n\n      return results;\n    });\n\n    _defineProperty(this, \"grab\", cType => {\n      const entity = this.locate(cType);\n\n      if (entity) {\n        const cc = this.componentCollections.get(entity.id);\n        const component = cc.get(cType);\n        return {\n          entity,\n          component\n        };\n      }\n\n      return null;\n    });\n\n    _defineProperty(this, \"grabBy\", (cType, predicate) => {\n      const entities = this.locateAll(cType);\n\n      for (const entity of entities) {\n        const cc = this.componentCollections.get(entity.id);\n        const component = cc.get(cType);\n\n        if (predicate(component)) {\n          return {\n            component,\n            entity\n          };\n        }\n      }\n\n      return null;\n    });\n\n    _defineProperty(this, \"grabAll\", cType => {\n      return this.locateAll(cType).map(entity => ({\n        entity,\n        component: entity.components.get(cType)\n      }));\n    });\n\n    _defineProperty(this, \"set\", (eid, component) => {\n      const cc = this.componentCollections.get(eid) || new _ComponentCollection__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n      cc.add(component);\n      this.componentCollections.set(eid, cc);\n\n      for (const [ctArr, entitySet] of this.entitiesByCTypes) {\n        if (ctArr.every(cc.has)) {\n          entitySet.add(eid);\n        }\n      }\n    });\n  }\n\n  registerSystem(cTypes) {\n    this.entitiesByCTypes.set(cTypes, new Set());\n  }\n\n  registerEntity(entity) {\n    const cc = new _ComponentCollection__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n    this.componentCollections.set(entity.id, cc);\n    this.entities.set(entity.id, entity);\n  }\n\n  clearEntityComponents(eid) {\n    this.componentCollections.set(eid, new _ComponentCollection__WEBPACK_IMPORTED_MODULE_0__[\"default\"]());\n\n    for (const entitySet of this.entitiesByCTypes.values()) {\n      if (entitySet.has(eid)) {\n        entitySet.delete(eid);\n      }\n    }\n  }\n\n  destroyEntity(eid) {\n    this.componentCollections.delete(eid);\n    this.entities.delete(eid);\n\n    for (const entitySet of this.entitiesByCTypes.values()) {\n      if (entitySet.has(eid)) {\n        entitySet.delete(eid);\n      }\n    }\n  }\n\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL3NyYy9Xb3JsZC50cz9jYzBiIl0sIm5hbWVzIjpbIldvcmxkIiwiTWFwIiwicHJlZGljYXRlIiwiZW50aXR5IiwiZW50aXRpZXMiLCJ2YWx1ZXMiLCJyZXN1bHRzIiwicHVzaCIsImNUeXBlcyIsImNvbXBvbmVudHMiLCJoYXMiLCJjVHlwZSIsImxvY2F0ZSIsImNjIiwiY29tcG9uZW50Q29sbGVjdGlvbnMiLCJnZXQiLCJpZCIsImNvbXBvbmVudCIsImxvY2F0ZUFsbCIsIm1hcCIsImVpZCIsIkNvbXBvbmVudENvbGxlY3Rpb24iLCJhZGQiLCJzZXQiLCJjdEFyciIsImVudGl0eVNldCIsImVudGl0aWVzQnlDVHlwZXMiLCJldmVyeSIsInJlZ2lzdGVyU3lzdGVtIiwiU2V0IiwicmVnaXN0ZXJFbnRpdHkiLCJjbGVhckVudGl0eUNvbXBvbmVudHMiLCJkZWxldGUiLCJkZXN0cm95RW50aXR5Il0sIm1hcHBpbmdzIjoiOzs7OztBQUVBO0FBV2UsTUFBTUEsS0FBTixDQUFnQjtBQUFBO0FBQUEsa0RBQ2tDLElBQUlDLEdBQUosRUFEbEM7O0FBQUEsc0NBR1MsSUFBSUEsR0FBSixFQUhUOztBQUFBLDhDQUtnQixJQUFJQSxHQUFKLEVBTGhCOztBQUFBLGtDQVFyQkMsU0FBRCxJQUFxRDtBQUMxRCxXQUFLLE1BQU1DLE1BQVgsSUFBcUIsS0FBS0MsUUFBTCxDQUFjQyxNQUFkLEVBQXJCLEVBQTZDO0FBQzNDLFlBQUlILFNBQVMsQ0FBQ0MsTUFBRCxDQUFiLEVBQXVCO0FBQ3JCLGlCQUFPQSxNQUFQO0FBQ0Q7QUFDRjs7QUFFRCxhQUFPLElBQVA7QUFDRCxLQWhCNEI7O0FBQUEscUNBbUJsQkQsU0FBRCxJQUFnRDtBQUN4RCxZQUFNSSxPQUFxQixHQUFHLEVBQTlCOztBQUVBLFdBQUssTUFBTUgsTUFBWCxJQUFxQixLQUFLQyxRQUFMLENBQWNDLE1BQWQsRUFBckIsRUFBNkM7QUFDM0MsWUFBSUgsU0FBUyxDQUFDQyxNQUFELENBQWIsRUFBdUI7QUFDckJHLGlCQUFPLENBQUNDLElBQVIsQ0FBYUosTUFBYjtBQUNEO0FBQ0Y7O0FBRUQsYUFBT0csT0FBUDtBQUNELEtBN0I0Qjs7QUFBQSxvQ0FnQ25CRSxNQUFELElBQTBDO0FBQ2pELFdBQUssTUFBTUwsTUFBWCxJQUFxQixLQUFLQyxRQUFMLENBQWNDLE1BQWQsRUFBckIsRUFBNkM7QUFDM0MsWUFBSUYsTUFBTSxDQUFDTSxVQUFQLENBQWtCQyxHQUFsQixDQUFzQkYsTUFBdEIsQ0FBSixFQUFtQztBQUNqQyxpQkFBT0wsTUFBUDtBQUNEO0FBQ0Y7O0FBRUQsYUFBTyxJQUFQO0FBQ0QsS0F4QzRCOztBQUFBLHVDQTJDaEJLLE1BQUQsSUFBcUM7QUFDL0MsWUFBTUYsT0FBcUIsR0FBRyxFQUE5Qjs7QUFFQSxXQUFLLE1BQU1ILE1BQVgsSUFBcUIsS0FBS0MsUUFBTCxDQUFjQyxNQUFkLEVBQXJCLEVBQTZDO0FBQzNDLFlBQUlGLE1BQU0sQ0FBQ00sVUFBUCxDQUFrQkMsR0FBbEIsQ0FBc0JGLE1BQXRCLENBQUosRUFBbUM7QUFDakNGLGlCQUFPLENBQUNDLElBQVIsQ0FBYUosTUFBYjtBQUNEO0FBQ0Y7O0FBRUQsYUFBT0csT0FBUDtBQUNELEtBckQ0Qjs7QUFBQSxrQ0F1RGxCSyxLQUFKLElBQXFEO0FBQzFELFlBQU1SLE1BQU0sR0FBRyxLQUFLUyxNQUFMLENBQVlELEtBQVosQ0FBZjs7QUFFQSxVQUFJUixNQUFKLEVBQVk7QUFDVixjQUFNVSxFQUFFLEdBQUcsS0FBS0Msb0JBQUwsQ0FBMEJDLEdBQTFCLENBQThCWixNQUFNLENBQUNhLEVBQXJDLENBQVg7QUFFQSxjQUFNQyxTQUFTLEdBQUdKLEVBQUUsQ0FBQ0UsR0FBSCxDQUFVSixLQUFWLENBQWxCO0FBRUEsZUFBTztBQUNMUixnQkFESztBQUVMYztBQUZLLFNBQVA7QUFJRDs7QUFFRCxhQUFPLElBQVA7QUFDRCxLQXRFNEI7O0FBQUEsb0NBeUVwQixDQUFJTixLQUFKLEVBQWVULFNBQWYsS0FBa0Y7QUFDekYsWUFBTUUsUUFBUSxHQUFHLEtBQUtjLFNBQUwsQ0FBZVAsS0FBZixDQUFqQjs7QUFFQSxXQUFLLE1BQU1SLE1BQVgsSUFBcUJDLFFBQXJCLEVBQStCO0FBRTdCLGNBQU1TLEVBQUUsR0FBRyxLQUFLQyxvQkFBTCxDQUEwQkMsR0FBMUIsQ0FBOEJaLE1BQU0sQ0FBQ2EsRUFBckMsQ0FBWDtBQUVBLGNBQU1DLFNBQVMsR0FBR0osRUFBRSxDQUFDRSxHQUFILENBQVVKLEtBQVYsQ0FBbEI7O0FBR0EsWUFBSVQsU0FBUyxDQUFDZSxTQUFELENBQWIsRUFBMEI7QUFDeEIsaUJBQU87QUFDTEEscUJBREs7QUFFTGQ7QUFGSyxXQUFQO0FBSUQ7QUFDRjs7QUFFRCxhQUFPLElBQVA7QUFDRCxLQTVGNEI7O0FBQUEscUNBK0ZmUSxLQUFKLElBQWdEO0FBQ3hELGFBQU8sS0FDSk8sU0FESSxDQUNNUCxLQUROLEVBRUpRLEdBRkksQ0FFQWhCLE1BQU0sS0FBSztBQUNkQSxjQURjO0FBRWRjLGlCQUFTLEVBQUVkLE1BQU0sQ0FBQ00sVUFBUCxDQUFrQk0sR0FBbEIsQ0FBc0JKLEtBQXRCO0FBRkcsT0FBTCxDQUZOLENBQVA7QUFNRCxLQXRHNEI7O0FBQUEsaUNBd0d2QixDQUFDUyxHQUFELEVBQWdCSCxTQUFoQixLQUFtRDtBQUN2RCxZQUFNSixFQUFFLEdBQUcsS0FBS0Msb0JBQUwsQ0FBMEJDLEdBQTFCLENBQThCSyxHQUE5QixLQUFzQyxJQUFJQyw0REFBSixFQUFqRDtBQUVBUixRQUFFLENBQUNTLEdBQUgsQ0FBT0wsU0FBUDtBQUVBLFdBQUtILG9CQUFMLENBQTBCUyxHQUExQixDQUE4QkgsR0FBOUIsRUFBbUNQLEVBQW5DOztBQUVBLFdBQUssTUFBTSxDQUFDVyxLQUFELEVBQVFDLFNBQVIsQ0FBWCxJQUFpQyxLQUFLQyxnQkFBdEMsRUFBd0Q7QUFDdEQsWUFBSUYsS0FBSyxDQUFDRyxLQUFOLENBQVlkLEVBQUUsQ0FBQ0gsR0FBZixDQUFKLEVBQXlCO0FBQ3ZCZSxtQkFBUyxDQUFDSCxHQUFWLENBQWNGLEdBQWQ7QUFDRDtBQUNGO0FBQ0YsS0FwSDRCO0FBQUE7O0FBc0g3QlEsZ0JBQWMsQ0FBQ3BCLE1BQUQsRUFBcUI7QUFDakMsU0FBS2tCLGdCQUFMLENBQXNCSCxHQUF0QixDQUEwQmYsTUFBMUIsRUFBa0MsSUFBSXFCLEdBQUosRUFBbEM7QUFDRDs7QUFFREMsZ0JBQWMsQ0FBQzNCLE1BQUQsRUFBMkI7QUFDdkMsVUFBTVUsRUFBRSxHQUFHLElBQUlRLDREQUFKLEVBQVg7QUFFQSxTQUFLUCxvQkFBTCxDQUEwQlMsR0FBMUIsQ0FBOEJwQixNQUFNLENBQUNhLEVBQXJDLEVBQXlDSCxFQUF6QztBQUNBLFNBQUtULFFBQUwsQ0FBY21CLEdBQWQsQ0FBa0JwQixNQUFNLENBQUNhLEVBQXpCLEVBQTZCYixNQUE3QjtBQUNEOztBQUVENEIsdUJBQXFCLENBQUNYLEdBQUQsRUFBc0I7QUFDekMsU0FBS04sb0JBQUwsQ0FBMEJTLEdBQTFCLENBQThCSCxHQUE5QixFQUFtQyxJQUFJQyw0REFBSixFQUFuQzs7QUFFQSxTQUFLLE1BQU1JLFNBQVgsSUFBd0IsS0FBS0MsZ0JBQUwsQ0FBc0JyQixNQUF0QixFQUF4QixFQUF3RDtBQUN0RCxVQUFJb0IsU0FBUyxDQUFDZixHQUFWLENBQWNVLEdBQWQsQ0FBSixFQUF3QjtBQUN0QkssaUJBQVMsQ0FBQ08sTUFBVixDQUFpQlosR0FBakI7QUFDRDtBQUNGO0FBQ0Y7O0FBRURhLGVBQWEsQ0FBQ2IsR0FBRCxFQUFzQjtBQUNqQyxTQUFLTixvQkFBTCxDQUEwQmtCLE1BQTFCLENBQWlDWixHQUFqQztBQUNBLFNBQUtoQixRQUFMLENBQWM0QixNQUFkLENBQXFCWixHQUFyQjs7QUFFQSxTQUFLLE1BQU1LLFNBQVgsSUFBd0IsS0FBS0MsZ0JBQUwsQ0FBc0JyQixNQUF0QixFQUF4QixFQUF3RDtBQUN0RCxVQUFJb0IsU0FBUyxDQUFDZixHQUFWLENBQWNVLEdBQWQsQ0FBSixFQUF3QjtBQUN0QkssaUJBQVMsQ0FBQ08sTUFBVixDQUFpQlosR0FBakI7QUFDRDtBQUNGO0FBQ0Y7O0FBcEo0QiIsImZpbGUiOiIuL3NyYy9Xb3JsZC50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFbnRpdHksIHsgRW50aXR5SWQgfSBmcm9tICcuL0VudGl0eSc7XG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQgQ29tcG9uZW50Q29sbGVjdGlvbiBmcm9tICcuL0NvbXBvbmVudENvbGxlY3Rpb24nO1xuXG50eXBlIEZpbmRQcmVkaWNhdGU8Q1Q+ID0gKGVudGl0eTogRW50aXR5PENUPikgPT4gYm9vbGVhbjtcblxudHlwZSBHcmFiUHJlZGljYXRlPEM+ID0gKGNvbXBvbmVudDogQykgPT4gYm9vbGVhbjtcblxuaW50ZXJmYWNlIFNpbmdsZUNvbXBvbmVudFJlc3A8Q1QsIEM+IHtcbiAgZW50aXR5OiBFbnRpdHk8Q1Q+O1xuICBjb21wb25lbnQ6IEM7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdvcmxkPENUPiB7XG4gIGNvbXBvbmVudENvbGxlY3Rpb25zOiBNYXA8RW50aXR5SWQsIENvbXBvbmVudENvbGxlY3Rpb248Q1Q+PiA9IG5ldyBNYXAoKTtcblxuICBlbnRpdGllczogTWFwPEVudGl0eUlkLCBFbnRpdHk8Q1Q+PiA9IG5ldyBNYXAoKTtcblxuICBlbnRpdGllc0J5Q1R5cGVzOiBNYXA8Q1RbXSwgU2V0PEVudGl0eUlkPj4gPSBuZXcgTWFwKCk7XG5cbiAgLyoqIFwiZmluZHNcIiBhIHNpbmdsZSBlbnRpdHkgYmFzZWQgb24gYSBwcmVkaWNhdGUgKi9cbiAgZmluZCA9IChwcmVkaWNhdGU6IEZpbmRQcmVkaWNhdGU8Q1Q+KTogRW50aXR5PENUPiB8IG51bGwgPT4ge1xuICAgIGZvciAoY29uc3QgZW50aXR5IG9mIHRoaXMuZW50aXRpZXMudmFsdWVzKCkpIHtcbiAgICAgIGlmIChwcmVkaWNhdGUoZW50aXR5KSkge1xuICAgICAgICByZXR1cm4gZW50aXR5O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIFwiZmluZHNcIiBhbGwgZW50aXRpZXMgYmFzZWQgb24gYSBwcmVkaWNhdGUsIGtpbmRhIGxpa2UgZmlsdGVyLiAqL1xuICBmaW5kQWxsID0gKHByZWRpY2F0ZTogRmluZFByZWRpY2F0ZTxDVD4pOiBFbnRpdHk8Q1Q+W10gPT4ge1xuICAgIGNvbnN0IHJlc3VsdHM6IEVudGl0eTxDVD5bXSA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBlbnRpdHkgb2YgdGhpcy5lbnRpdGllcy52YWx1ZXMoKSkge1xuICAgICAgaWYgKHByZWRpY2F0ZShlbnRpdHkpKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaChlbnRpdHkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgLyoqIFwibG9jYXRlc1wiIGEgc2luZ2xlIGVudGl0eSBiYXNlZCBvbiBpdHMgQ29tcG9uZW50cy4gKi9cbiAgbG9jYXRlID0gKGNUeXBlczogQ1QgfCBDVFtdKTogRW50aXR5PENUPiB8IG51bGwgPT4ge1xuICAgIGZvciAoY29uc3QgZW50aXR5IG9mIHRoaXMuZW50aXRpZXMudmFsdWVzKCkpIHtcbiAgICAgIGlmIChlbnRpdHkuY29tcG9uZW50cy5oYXMoY1R5cGVzKSkge1xuICAgICAgICByZXR1cm4gZW50aXR5O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIExvY2F0ZXMgYWxsIGVudGl0aWVzIHRoYXQgY29udGFpbiB0aGUgY29tcG9uZW50cyBuYW1lZCAqL1xuICBsb2NhdGVBbGwgPSAoY1R5cGVzOiBDVCB8IENUW10pOiBFbnRpdHk8Q1Q+W10gPT4ge1xuICAgIGNvbnN0IHJlc3VsdHM6IEVudGl0eTxDVD5bXSA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBlbnRpdHkgb2YgdGhpcy5lbnRpdGllcy52YWx1ZXMoKSkge1xuICAgICAgaWYgKGVudGl0eS5jb21wb25lbnRzLmhhcyhjVHlwZXMpKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaChlbnRpdHkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgZ3JhYiA9IDxDPihjVHlwZTogQ1QpOiBTaW5nbGVDb21wb25lbnRSZXNwPENULCBDPiB8IG51bGwgPT4ge1xuICAgIGNvbnN0IGVudGl0eSA9IHRoaXMubG9jYXRlKGNUeXBlKTtcblxuICAgIGlmIChlbnRpdHkpIHtcbiAgICAgIGNvbnN0IGNjID0gdGhpcy5jb21wb25lbnRDb2xsZWN0aW9ucy5nZXQoZW50aXR5LmlkKTtcbiAgXG4gICAgICBjb25zdCBjb21wb25lbnQgPSBjYy5nZXQ8Qz4oY1R5cGUpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBlbnRpdHksXG4gICAgICAgIGNvbXBvbmVudCxcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qIEdyYWIgc2luZ2xlIGNvbXBvbmVudCBiYXNlZCBvbiBjb21wb25lbnQgdHlwZSBhbmQgcHJlZGljYXRlLiAqL1xuICBncmFiQnkgPSA8Qz4oY1R5cGU6IENULCBwcmVkaWNhdGU6IEdyYWJQcmVkaWNhdGU8Qz4pOiBTaW5nbGVDb21wb25lbnRSZXNwPENULCBDPiB8IG51bGwgPT4ge1xuICAgIGNvbnN0IGVudGl0aWVzID0gdGhpcy5sb2NhdGVBbGwoY1R5cGUpO1xuXG4gICAgZm9yIChjb25zdCBlbnRpdHkgb2YgZW50aXRpZXMpIHtcblxuICAgICAgY29uc3QgY2MgPSB0aGlzLmNvbXBvbmVudENvbGxlY3Rpb25zLmdldChlbnRpdHkuaWQpO1xuXG4gICAgICBjb25zdCBjb21wb25lbnQgPSBjYy5nZXQ8Qz4oY1R5cGUpO1xuXG5cbiAgICAgIGlmIChwcmVkaWNhdGUoY29tcG9uZW50KSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNvbXBvbmVudCxcbiAgICAgICAgICBlbnRpdHksXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBHcmFiIGFsbCB0aGUgY29tcG9uZW50cyBwcmltYXJpbHksIGFuZCB0aGUgZW50aXRpZXMgaWYgbmVlZGVkICAqL1xuICBncmFiQWxsID0gPEM+KGNUeXBlOiBDVCk6IFNpbmdsZUNvbXBvbmVudFJlc3A8Q1QsIEM+W10gPT4ge1xuICAgIHJldHVybiB0aGlzXG4gICAgICAubG9jYXRlQWxsKGNUeXBlKVxuICAgICAgLm1hcChlbnRpdHkgPT4gKHtcbiAgICAgICAgZW50aXR5LFxuICAgICAgICBjb21wb25lbnQ6IGVudGl0eS5jb21wb25lbnRzLmdldChjVHlwZSkgYXMgdW5rbm93biBhcyBDLFxuICAgICAgfSkpO1xuICB9XG5cbiAgc2V0ID0gKGVpZDogRW50aXR5SWQsIGNvbXBvbmVudDogQ29tcG9uZW50PENUPik6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGNjID0gdGhpcy5jb21wb25lbnRDb2xsZWN0aW9ucy5nZXQoZWlkKSB8fCBuZXcgQ29tcG9uZW50Q29sbGVjdGlvbjxDVD4oKTtcblxuICAgIGNjLmFkZChjb21wb25lbnQpO1xuXG4gICAgdGhpcy5jb21wb25lbnRDb2xsZWN0aW9ucy5zZXQoZWlkLCBjYyk7XG5cbiAgICBmb3IgKGNvbnN0IFtjdEFyciwgZW50aXR5U2V0XSBvZiB0aGlzLmVudGl0aWVzQnlDVHlwZXMpIHtcbiAgICAgIGlmIChjdEFyci5ldmVyeShjYy5oYXMpKSB7XG4gICAgICAgIGVudGl0eVNldC5hZGQoZWlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZWdpc3RlclN5c3RlbShjVHlwZXM6IENUW10pOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0aWVzQnlDVHlwZXMuc2V0KGNUeXBlcywgbmV3IFNldDxFbnRpdHlJZD4oKSk7XG4gIH1cblxuICByZWdpc3RlckVudGl0eShlbnRpdHk6IEVudGl0eTxDVD4pOiB2b2lkIHtcbiAgICBjb25zdCBjYyA9IG5ldyBDb21wb25lbnRDb2xsZWN0aW9uPENUPigpO1xuXG4gICAgdGhpcy5jb21wb25lbnRDb2xsZWN0aW9ucy5zZXQoZW50aXR5LmlkLCBjYyk7XG4gICAgdGhpcy5lbnRpdGllcy5zZXQoZW50aXR5LmlkLCBlbnRpdHkpO1xuICB9XG5cbiAgY2xlYXJFbnRpdHlDb21wb25lbnRzKGVpZDogRW50aXR5SWQpOiB2b2lkIHtcbiAgICB0aGlzLmNvbXBvbmVudENvbGxlY3Rpb25zLnNldChlaWQsIG5ldyBDb21wb25lbnRDb2xsZWN0aW9uPENUPigpKTtcblxuICAgIGZvciAoY29uc3QgZW50aXR5U2V0IG9mIHRoaXMuZW50aXRpZXNCeUNUeXBlcy52YWx1ZXMoKSkge1xuICAgICAgaWYgKGVudGl0eVNldC5oYXMoZWlkKSkge1xuICAgICAgICBlbnRpdHlTZXQuZGVsZXRlKGVpZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveUVudGl0eShlaWQ6IEVudGl0eUlkKTogdm9pZCB7XG4gICAgdGhpcy5jb21wb25lbnRDb2xsZWN0aW9ucy5kZWxldGUoZWlkKTtcbiAgICB0aGlzLmVudGl0aWVzLmRlbGV0ZShlaWQpO1xuXG4gICAgZm9yIChjb25zdCBlbnRpdHlTZXQgb2YgdGhpcy5lbnRpdGllc0J5Q1R5cGVzLnZhbHVlcygpKSB7XG4gICAgICBpZiAoZW50aXR5U2V0LmhhcyhlaWQpKSB7XG4gICAgICAgIGVudGl0eVNldC5kZWxldGUoZWlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/World.ts\n");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! exports provided: World, createEntity, createSystem */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _World__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./World */ \"./src/World.ts\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"World\", function() { return _World__WEBPACK_IMPORTED_MODULE_0__[\"default\"]; });\n\n/* harmony import */ var _Entity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Entity */ \"./src/Entity.ts\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"createEntity\", function() { return _Entity__WEBPACK_IMPORTED_MODULE_1__[\"createEntity\"]; });\n\n/* harmony import */ var _System__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./System */ \"./src/System.ts\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"createSystem\", function() { return _System__WEBPACK_IMPORTED_MODULE_2__[\"createSystem\"]; });\n\n\n\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL3NyYy9pbmRleC50cz9mZmI0Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUNBIiwiZmlsZSI6Ii4vc3JjL2luZGV4LnRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFdvcmxkIGZyb20gJy4vV29ybGQnO1xuaW1wb3J0IHsgY3JlYXRlRW50aXR5IH0gZnJvbSAnLi9FbnRpdHknO1xuaW1wb3J0IHsgY3JlYXRlU3lzdGVtIH0gZnJvbSAnLi9TeXN0ZW0nO1xuXG5leHBvcnQge1xuICBXb3JsZCxcbiAgY3JlYXRlRW50aXR5LFxuICBjcmVhdGVTeXN0ZW0sXG59O1xuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/index.ts\n");

/***/ }),

/***/ 0:
/*!****************************!*\
  !*** multi ./src/index.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/bstilley/repos/ecstatic/src/index.ts */"./src/index.ts");


/***/ })

/******/ });
});