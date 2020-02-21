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
/******/ 	var hotCurrentHash = "914d52a955f0c8feae1a";
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
/******/ 				/*globals chunkId */
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

/***/ "./node_modules/uuid/lib/bytesToUuid.js":
/*!**********************************************!*\
  !*** ./node_modules/uuid/lib/bytesToUuid.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/**\n * Convert array of 16 byte values to UUID string format of the form:\n * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX\n */\nvar byteToHex = [];\nfor (var i = 0; i < 256; ++i) {\n  byteToHex[i] = (i + 0x100).toString(16).substr(1);\n}\n\nfunction bytesToUuid(buf, offset) {\n  var i = offset || 0;\n  var bth = byteToHex;\n  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4\n  return ([\n    bth[buf[i++]], bth[buf[i++]],\n    bth[buf[i++]], bth[buf[i++]], '-',\n    bth[buf[i++]], bth[buf[i++]], '-',\n    bth[buf[i++]], bth[buf[i++]], '-',\n    bth[buf[i++]], bth[buf[i++]], '-',\n    bth[buf[i++]], bth[buf[i++]],\n    bth[buf[i++]], bth[buf[i++]],\n    bth[buf[i++]], bth[buf[i++]]\n  ]).join('');\n}\n\nmodule.exports = bytesToUuid;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL25vZGVfbW9kdWxlcy91dWlkL2xpYi9ieXRlc1RvVXVpZC5qcz8yMzY2Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLFNBQVM7QUFDeEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEiLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvdXVpZC9saWIvYnl0ZXNUb1V1aWQuanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvbnZlcnQgYXJyYXkgb2YgMTYgYnl0ZSB2YWx1ZXMgdG8gVVVJRCBzdHJpbmcgZm9ybWF0IG9mIHRoZSBmb3JtOlxuICogWFhYWFhYWFgtWFhYWC1YWFhYLVhYWFgtWFhYWFhYWFhYWFhYXG4gKi9cbnZhciBieXRlVG9IZXggPSBbXTtcbmZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgYnl0ZVRvSGV4W2ldID0gKGkgKyAweDEwMCkudG9TdHJpbmcoMTYpLnN1YnN0cigxKTtcbn1cblxuZnVuY3Rpb24gYnl0ZXNUb1V1aWQoYnVmLCBvZmZzZXQpIHtcbiAgdmFyIGkgPSBvZmZzZXQgfHwgMDtcbiAgdmFyIGJ0aCA9IGJ5dGVUb0hleDtcbiAgLy8gam9pbiB1c2VkIHRvIGZpeCBtZW1vcnkgaXNzdWUgY2F1c2VkIGJ5IGNvbmNhdGVuYXRpb246IGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTMxNzUjYzRcbiAgcmV0dXJuIChbXG4gICAgYnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSxcbiAgICBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCAnLScsXG4gICAgYnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSwgJy0nLFxuICAgIGJ0aFtidWZbaSsrXV0sIGJ0aFtidWZbaSsrXV0sICctJyxcbiAgICBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCAnLScsXG4gICAgYnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSxcbiAgICBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLFxuICAgIGJ0aFtidWZbaSsrXV0sIGJ0aFtidWZbaSsrXV1cbiAgXSkuam9pbignJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYnl0ZXNUb1V1aWQ7XG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./node_modules/uuid/lib/bytesToUuid.js\n");

/***/ }),

/***/ "./node_modules/uuid/lib/rng-browser.js":
/*!**********************************************!*\
  !*** ./node_modules/uuid/lib/rng-browser.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// Unique ID creation requires a high quality random # generator.  In the\n// browser this is a little complicated due to unknown quality of Math.random()\n// and inconsistent support for the `crypto` API.  We do the best we can via\n// feature-detection\n\n// getRandomValues needs to be invoked in a context where \"this\" is a Crypto\n// implementation. Also, find the complete implementation of crypto on IE11.\nvar getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||\n                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));\n\nif (getRandomValues) {\n  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto\n  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef\n\n  module.exports = function whatwgRNG() {\n    getRandomValues(rnds8);\n    return rnds8;\n  };\n} else {\n  // Math.random()-based (RNG)\n  //\n  // If all else fails, use Math.random().  It's fast, but is of unspecified\n  // quality.\n  var rnds = new Array(16);\n\n  module.exports = function mathRNG() {\n    for (var i = 0, r; i < 16; i++) {\n      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;\n      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;\n    }\n\n    return rnds;\n  };\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL25vZGVfbW9kdWxlcy91dWlkL2xpYi9ybmctYnJvd3Nlci5qcz9lMWY0Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxpQ0FBaUM7O0FBRWpDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxzQkFBc0IsUUFBUTtBQUM5QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBIiwiZmlsZSI6Ii4vbm9kZV9tb2R1bGVzL3V1aWQvbGliL3JuZy1icm93c2VyLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVW5pcXVlIElEIGNyZWF0aW9uIHJlcXVpcmVzIGEgaGlnaCBxdWFsaXR5IHJhbmRvbSAjIGdlbmVyYXRvci4gIEluIHRoZVxuLy8gYnJvd3NlciB0aGlzIGlzIGEgbGl0dGxlIGNvbXBsaWNhdGVkIGR1ZSB0byB1bmtub3duIHF1YWxpdHkgb2YgTWF0aC5yYW5kb20oKVxuLy8gYW5kIGluY29uc2lzdGVudCBzdXBwb3J0IGZvciB0aGUgYGNyeXB0b2AgQVBJLiAgV2UgZG8gdGhlIGJlc3Qgd2UgY2FuIHZpYVxuLy8gZmVhdHVyZS1kZXRlY3Rpb25cblxuLy8gZ2V0UmFuZG9tVmFsdWVzIG5lZWRzIHRvIGJlIGludm9rZWQgaW4gYSBjb250ZXh0IHdoZXJlIFwidGhpc1wiIGlzIGEgQ3J5cHRvXG4vLyBpbXBsZW1lbnRhdGlvbi4gQWxzbywgZmluZCB0aGUgY29tcGxldGUgaW1wbGVtZW50YXRpb24gb2YgY3J5cHRvIG9uIElFMTEuXG52YXIgZ2V0UmFuZG9tVmFsdWVzID0gKHR5cGVvZihjcnlwdG8pICE9ICd1bmRlZmluZWQnICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMgJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKGNyeXB0bykpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgKHR5cGVvZihtc0NyeXB0bykgIT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvdy5tc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMgPT0gJ2Z1bmN0aW9uJyAmJiBtc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMuYmluZChtc0NyeXB0bykpO1xuXG5pZiAoZ2V0UmFuZG9tVmFsdWVzKSB7XG4gIC8vIFdIQVRXRyBjcnlwdG8gUk5HIC0gaHR0cDovL3dpa2kud2hhdHdnLm9yZy93aWtpL0NyeXB0b1xuICB2YXIgcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHdoYXR3Z1JORygpIHtcbiAgICBnZXRSYW5kb21WYWx1ZXMocm5kczgpO1xuICAgIHJldHVybiBybmRzODtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIE1hdGgucmFuZG9tKCktYmFzZWQgKFJORylcbiAgLy9cbiAgLy8gSWYgYWxsIGVsc2UgZmFpbHMsIHVzZSBNYXRoLnJhbmRvbSgpLiAgSXQncyBmYXN0LCBidXQgaXMgb2YgdW5zcGVjaWZpZWRcbiAgLy8gcXVhbGl0eS5cbiAgdmFyIHJuZHMgPSBuZXcgQXJyYXkoMTYpO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWF0aFJORygpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgcjsgaSA8IDE2OyBpKyspIHtcbiAgICAgIGlmICgoaSAmIDB4MDMpID09PSAwKSByID0gTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwO1xuICAgICAgcm5kc1tpXSA9IHIgPj4+ICgoaSAmIDB4MDMpIDw8IDMpICYgMHhmZjtcbiAgICB9XG5cbiAgICByZXR1cm4gcm5kcztcbiAgfTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./node_modules/uuid/lib/rng-browser.js\n");

/***/ }),

/***/ "./node_modules/uuid/v4.js":
/*!*********************************!*\
  !*** ./node_modules/uuid/v4.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var rng = __webpack_require__(/*! ./lib/rng */ \"./node_modules/uuid/lib/rng-browser.js\");\nvar bytesToUuid = __webpack_require__(/*! ./lib/bytesToUuid */ \"./node_modules/uuid/lib/bytesToUuid.js\");\n\nfunction v4(options, buf, offset) {\n  var i = buf && offset || 0;\n\n  if (typeof(options) == 'string') {\n    buf = options === 'binary' ? new Array(16) : null;\n    options = null;\n  }\n  options = options || {};\n\n  var rnds = options.random || (options.rng || rng)();\n\n  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`\n  rnds[6] = (rnds[6] & 0x0f) | 0x40;\n  rnds[8] = (rnds[8] & 0x3f) | 0x80;\n\n  // Copy bytes to buffer, if provided\n  if (buf) {\n    for (var ii = 0; ii < 16; ++ii) {\n      buf[i + ii] = rnds[ii];\n    }\n  }\n\n  return buf || bytesToUuid(rnds);\n}\n\nmodule.exports = v4;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL25vZGVfbW9kdWxlcy91dWlkL3Y0LmpzP2M2NGUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsVUFBVSxtQkFBTyxDQUFDLHlEQUFXO0FBQzdCLGtCQUFrQixtQkFBTyxDQUFDLGlFQUFtQjs7QUFFN0M7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esb0JBQW9CLFNBQVM7QUFDN0I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEiLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvdXVpZC92NC5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBybmcgPSByZXF1aXJlKCcuL2xpYi9ybmcnKTtcbnZhciBieXRlc1RvVXVpZCA9IHJlcXVpcmUoJy4vbGliL2J5dGVzVG9VdWlkJyk7XG5cbmZ1bmN0aW9uIHY0KG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gIHZhciBpID0gYnVmICYmIG9mZnNldCB8fCAwO1xuXG4gIGlmICh0eXBlb2Yob3B0aW9ucykgPT0gJ3N0cmluZycpIHtcbiAgICBidWYgPSBvcHRpb25zID09PSAnYmluYXJ5JyA/IG5ldyBBcnJheSgxNikgOiBudWxsO1xuICAgIG9wdGlvbnMgPSBudWxsO1xuICB9XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHZhciBybmRzID0gb3B0aW9ucy5yYW5kb20gfHwgKG9wdGlvbnMucm5nIHx8IHJuZykoKTtcblxuICAvLyBQZXIgNC40LCBzZXQgYml0cyBmb3IgdmVyc2lvbiBhbmQgYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgXG4gIHJuZHNbNl0gPSAocm5kc1s2XSAmIDB4MGYpIHwgMHg0MDtcbiAgcm5kc1s4XSA9IChybmRzWzhdICYgMHgzZikgfCAweDgwO1xuXG4gIC8vIENvcHkgYnl0ZXMgdG8gYnVmZmVyLCBpZiBwcm92aWRlZFxuICBpZiAoYnVmKSB7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IDE2OyArK2lpKSB7XG4gICAgICBidWZbaSArIGlpXSA9IHJuZHNbaWldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWYgfHwgYnl0ZXNUb1V1aWQocm5kcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdjQ7XG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./node_modules/uuid/v4.js\n");

/***/ }),

/***/ "./src/ComponentCollection.ts":
/*!************************************!*\
  !*** ./src/ComponentCollection.ts ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return ComponentCollection; });\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\nclass ComponentCollection {\n  constructor() {\n    _defineProperty(this, \"components\", new Map());\n\n    _defineProperty(this, \"add\", component => {\n      this.components.set(component.type, component);\n    });\n\n    _defineProperty(this, \"update\", (cType, func) => {\n      if (this.components.has(cType)) {\n        const c = this.components.get(cType);\n\n        if (c) {\n          const updatedComponent = func(c);\n          this.components.set(cType, updatedComponent);\n        }\n      }\n    });\n\n    _defineProperty(this, \"get\", cType => {\n      if (!this.components.has(cType)) {\n        throw new Error(`ComponentCollection does not have component of type ${cType}`);\n      }\n\n      return this.components.get(cType);\n    });\n\n    _defineProperty(this, \"has\", cType => {\n      return this.components.has(cType);\n    });\n\n    _defineProperty(this, \"size\", () => {\n      return this.components.size;\n    });\n  }\n\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL3NyYy9Db21wb25lbnRDb2xsZWN0aW9uLnRzPzUxYzQiXSwibmFtZXMiOlsiQ29tcG9uZW50Q29sbGVjdGlvbiIsIk1hcCIsImNvbXBvbmVudCIsImNvbXBvbmVudHMiLCJzZXQiLCJ0eXBlIiwiY1R5cGUiLCJmdW5jIiwiaGFzIiwiYyIsImdldCIsInVwZGF0ZWRDb21wb25lbnQiLCJFcnJvciIsInNpemUiXSwibWFwcGluZ3MiOiI7Ozs7QUFFZSxNQUFNQSxtQkFBTixDQUE4QjtBQUFBO0FBQUEsd0NBQ0UsSUFBSUMsR0FBSixFQURGOztBQUFBLGlDQUdwQ0MsU0FBRCxJQUFvQztBQUN4QyxXQUFLQyxVQUFMLENBQWdCQyxHQUFoQixDQUFvQkYsU0FBUyxDQUFDRyxJQUE5QixFQUFvQ0gsU0FBcEM7QUFDRCxLQUwwQzs7QUFBQSxvQ0FPbEMsQ0FBQ0ksS0FBRCxFQUFZQyxJQUFaLEtBQWdFO0FBQ3ZFLFVBQUksS0FBS0osVUFBTCxDQUFnQkssR0FBaEIsQ0FBb0JGLEtBQXBCLENBQUosRUFBZ0M7QUFDOUIsY0FBTUcsQ0FBQyxHQUFHLEtBQUtOLFVBQUwsQ0FBZ0JPLEdBQWhCLENBQW9CSixLQUFwQixDQUFWOztBQUVBLFlBQUlHLENBQUosRUFBTztBQUNMLGdCQUFNRSxnQkFBZ0IsR0FBR0osSUFBSSxDQUFDRSxDQUFELENBQTdCO0FBQ0EsZUFBS04sVUFBTCxDQUFnQkMsR0FBaEIsQ0FBb0JFLEtBQXBCLEVBQTJCSyxnQkFBM0I7QUFDRDtBQUNGO0FBQ0YsS0FoQjBDOztBQUFBLGlDQWtCcENMLEtBQUQsSUFBOEI7QUFDbEMsVUFBSSxDQUFDLEtBQUtILFVBQUwsQ0FBZ0JLLEdBQWhCLENBQW9CRixLQUFwQixDQUFMLEVBQWlDO0FBQy9CLGNBQU0sSUFBSU0sS0FBSixDQUFXLHVEQUFzRE4sS0FBTSxFQUF2RSxDQUFOO0FBQ0Q7O0FBRUQsYUFBTyxLQUFLSCxVQUFMLENBQWdCTyxHQUFoQixDQUFvQkosS0FBcEIsQ0FBUDtBQUNELEtBeEIwQzs7QUFBQSxpQ0EwQnBDQSxLQUFELElBQXdCO0FBQzVCLGFBQU8sS0FBS0gsVUFBTCxDQUFnQkssR0FBaEIsQ0FBb0JGLEtBQXBCLENBQVA7QUFDRCxLQTVCMEM7O0FBQUEsa0NBOEJwQyxNQUFjO0FBQ25CLGFBQU8sS0FBS0gsVUFBTCxDQUFnQlUsSUFBdkI7QUFDRCxLQWhDMEM7QUFBQTs7QUFBQSIsImZpbGUiOiIuL3NyYy9Db21wb25lbnRDb2xsZWN0aW9uLnRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi9Db21wb25lbnQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21wb25lbnRDb2xsZWN0aW9uPENUPiB7XG4gIHByaXZhdGUgY29tcG9uZW50czogTWFwPENULCBDb21wb25lbnQ8Q1Q+PiA9IG5ldyBNYXAoKTtcblxuICBhZGQgPSAoY29tcG9uZW50OiBDb21wb25lbnQ8Q1Q+KTogdm9pZCA9PiB7XG4gICAgdGhpcy5jb21wb25lbnRzLnNldChjb21wb25lbnQudHlwZSwgY29tcG9uZW50KTtcbiAgfVxuXG4gIHVwZGF0ZSA9IChjVHlwZTogQ1QsIGZ1bmM6IChjOiBDb21wb25lbnQ8Q1Q+KSA9PiBDb21wb25lbnQ8Q1Q+KTogdm9pZCA9PiB7XG4gICAgaWYgKHRoaXMuY29tcG9uZW50cy5oYXMoY1R5cGUpKSB7XG4gICAgICBjb25zdCBjID0gdGhpcy5jb21wb25lbnRzLmdldChjVHlwZSk7XG5cbiAgICAgIGlmIChjKSB7XG4gICAgICAgIGNvbnN0IHVwZGF0ZWRDb21wb25lbnQgPSBmdW5jKGMpO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMuc2V0KGNUeXBlLCB1cGRhdGVkQ29tcG9uZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZ2V0ID0gKGNUeXBlOiBDVCk6IENvbXBvbmVudDxDVD4gPT4ge1xuICAgIGlmICghdGhpcy5jb21wb25lbnRzLmhhcyhjVHlwZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ29tcG9uZW50Q29sbGVjdGlvbiBkb2VzIG5vdCBoYXZlIGNvbXBvbmVudCBvZiB0eXBlICR7Y1R5cGV9YClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5nZXQoY1R5cGUpO1xuICB9XG5cbiAgaGFzID0gKGNUeXBlOiBDVCk6IGJvb2xlYW4gPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMuaGFzKGNUeXBlKVxuICB9XG5cbiAgc2l6ZSA9ICgpOiBudW1iZXIgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMuc2l6ZTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/ComponentCollection.ts\n");

/***/ }),

/***/ "./src/Entity.ts":
/*!***********************!*\
  !*** ./src/Entity.ts ***!
  \***********************/
/*! exports provided: default, createEntity */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Entity; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createEntity\", function() { return createEntity; });\n/* harmony import */ var uuid_v4__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! uuid/v4 */ \"./node_modules/uuid/v4.js\");\n/* harmony import */ var uuid_v4__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(uuid_v4__WEBPACK_IMPORTED_MODULE_0__);\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n\nclass Entity {\n  constructor(world) {\n    _defineProperty(this, \"id\", void 0);\n\n    _defineProperty(this, \"world\", void 0);\n\n    this.id = uuid_v4__WEBPACK_IMPORTED_MODULE_0___default()();\n    this.world = world;\n    /*\n    Registering with the World.\n    */\n\n    this.world.registerEntity(this);\n  }\n\n  add(component) {\n    this.world.set(this.id, component);\n    return this;\n  }\n  /** Clears all components from an Entity */\n\n\n  clear() {\n    this.world.clearEntityComponents(this.id);\n    return this;\n  }\n\n  destroy() {\n    this.world.destroyEntity(this.id);\n  } // TODO: figure out some much better error handling throughout this library.\n\n\n  getComponent(cType) {\n    const cc = this.world.entities.get(this.id);\n\n    if (!cc) {\n      console.error('unable to find component collection for specified entity: ', this.id);\n    }\n\n    const component = cc.get(cType);\n\n    if (!component) {\n      console.error(`Unable to find component of type ${cType} in entity ${this.id}`);\n    }\n\n    return component;\n  }\n\n  getComponents() {\n    return this.world.componentCollections.get(this.id);\n  }\n\n}\nfunction createEntity(world) {\n  const entity = new Entity(world);\n  return entity;\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL3NyYy9FbnRpdHkudHM/YWM2OCJdLCJuYW1lcyI6WyJFbnRpdHkiLCJjb25zdHJ1Y3RvciIsIndvcmxkIiwiaWQiLCJ1dWlkdjQiLCJyZWdpc3RlckVudGl0eSIsImFkZCIsImNvbXBvbmVudCIsInNldCIsImNsZWFyIiwiY2xlYXJFbnRpdHlDb21wb25lbnRzIiwiZGVzdHJveSIsImRlc3Ryb3lFbnRpdHkiLCJnZXRDb21wb25lbnQiLCJjVHlwZSIsImNjIiwiZW50aXRpZXMiLCJnZXQiLCJjb25zb2xlIiwiZXJyb3IiLCJnZXRDb21wb25lbnRzIiwiY29tcG9uZW50Q29sbGVjdGlvbnMiLCJjcmVhdGVFbnRpdHkiLCJlbnRpdHkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTtBQU9lLE1BQU1BLE1BQU4sQ0FBaUI7QUFJOUJDLGFBQVcsQ0FBQ0MsS0FBRCxFQUFtQjtBQUFBOztBQUFBOztBQUM1QixTQUFLQyxFQUFMLEdBQVVDLDhDQUFNLEVBQWhCO0FBQ0EsU0FBS0YsS0FBTCxHQUFhQSxLQUFiO0FBRUE7Ozs7QUFHQSxTQUFLQSxLQUFMLENBQVdHLGNBQVgsQ0FBMEIsSUFBMUI7QUFDRDs7QUFFREMsS0FBRyxDQUFDQyxTQUFELEVBQXVDO0FBQ3hDLFNBQUtMLEtBQUwsQ0FBV00sR0FBWCxDQUFlLEtBQUtMLEVBQXBCLEVBQXdCSSxTQUF4QjtBQUVBLFdBQU8sSUFBUDtBQUNEO0FBRUQ7OztBQUNBRSxPQUFLLEdBQWU7QUFDbEIsU0FBS1AsS0FBTCxDQUFXUSxxQkFBWCxDQUFpQyxLQUFLUCxFQUF0QztBQUVBLFdBQU8sSUFBUDtBQUNEOztBQUVEUSxTQUFPLEdBQVM7QUFDZCxTQUFLVCxLQUFMLENBQVdVLGFBQVgsQ0FBeUIsS0FBS1QsRUFBOUI7QUFDRCxHQTdCNkIsQ0ErQjlCOzs7QUFDQVUsY0FBWSxDQUFDQyxLQUFELEVBQTJCO0FBQ3JDLFVBQU1DLEVBQUUsR0FBRyxLQUFLYixLQUFMLENBQVdjLFFBQVgsQ0FBb0JDLEdBQXBCLENBQXdCLEtBQUtkLEVBQTdCLENBQVg7O0FBRUEsUUFBSSxDQUFDWSxFQUFMLEVBQVM7QUFDUEcsYUFBTyxDQUFDQyxLQUFSLENBQWMsNERBQWQsRUFBNEUsS0FBS2hCLEVBQWpGO0FBQ0Q7O0FBRUQsVUFBTUksU0FBUyxHQUFHUSxFQUFFLENBQUNFLEdBQUgsQ0FBT0gsS0FBUCxDQUFsQjs7QUFFQSxRQUFJLENBQUNQLFNBQUwsRUFBZ0I7QUFDZFcsYUFBTyxDQUFDQyxLQUFSLENBQWUsb0NBQW1DTCxLQUFNLGNBQWEsS0FBS1gsRUFBRyxFQUE3RTtBQUNEOztBQUdELFdBQU9JLFNBQVA7QUFDRDs7QUFFRGEsZUFBYSxHQUE0QjtBQUN2QyxXQUFPLEtBQUtsQixLQUFMLENBQVdtQixvQkFBWCxDQUFnQ0osR0FBaEMsQ0FBb0MsS0FBS2QsRUFBekMsQ0FBUDtBQUNEOztBQW5ENkI7QUFzRHpCLFNBQVNtQixZQUFULENBQ0xwQixLQURLLEVBRU87QUFDWixRQUFNcUIsTUFBTSxHQUFHLElBQUl2QixNQUFKLENBQWVFLEtBQWYsQ0FBZjtBQUVBLFNBQU9xQixNQUFQO0FBQ0QiLCJmaWxlIjoiLi9zcmMvRW50aXR5LnRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHV1aWR2NCBmcm9tICd1dWlkL3Y0JztcbmltcG9ydCBXb3JsZCBmcm9tICcuL1dvcmxkJztcbmltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCBDb21wb25lbnRDb2xsZWN0aW9uIGZyb20gJy4vQ29tcG9uZW50Q29sbGVjdGlvbic7XG5cbmV4cG9ydCB0eXBlIEVudGl0eUlkID0gc3RyaW5nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbnRpdHk8Q1Q+IHtcbiAgaWQ6IHN0cmluZztcbiAgd29ybGQ6IFdvcmxkPENUPjtcblxuICBjb25zdHJ1Y3Rvcih3b3JsZDogV29ybGQ8Q1Q+KSB7XG4gICAgdGhpcy5pZCA9IHV1aWR2NCgpO1xuICAgIHRoaXMud29ybGQgPSB3b3JsZDtcblxuICAgIC8qXG4gICAgUmVnaXN0ZXJpbmcgd2l0aCB0aGUgV29ybGQuXG4gICAgKi9cbiAgICB0aGlzLndvcmxkLnJlZ2lzdGVyRW50aXR5KHRoaXMpO1xuICB9XG5cbiAgYWRkKGNvbXBvbmVudDogQ29tcG9uZW50PENUPik6IEVudGl0eTxDVD4ge1xuICAgIHRoaXMud29ybGQuc2V0KHRoaXMuaWQsIGNvbXBvbmVudCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKiBDbGVhcnMgYWxsIGNvbXBvbmVudHMgZnJvbSBhbiBFbnRpdHkgKi9cbiAgY2xlYXIoKTogRW50aXR5PENUPiB7XG4gICAgdGhpcy53b3JsZC5jbGVhckVudGl0eUNvbXBvbmVudHModGhpcy5pZCk7XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLndvcmxkLmRlc3Ryb3lFbnRpdHkodGhpcy5pZCk7XG4gIH1cblxuICAvLyBUT0RPOiBmaWd1cmUgb3V0IHNvbWUgbXVjaCBiZXR0ZXIgZXJyb3IgaGFuZGxpbmcgdGhyb3VnaG91dCB0aGlzIGxpYnJhcnkuXG4gIGdldENvbXBvbmVudChjVHlwZTogQ1QpOiBDb21wb25lbnQ8Q1Q+IHtcbiAgICBjb25zdCBjYyA9IHRoaXMud29ybGQuZW50aXRpZXMuZ2V0KHRoaXMuaWQpO1xuXG4gICAgaWYgKCFjYykge1xuICAgICAgY29uc29sZS5lcnJvcigndW5hYmxlIHRvIGZpbmQgY29tcG9uZW50IGNvbGxlY3Rpb24gZm9yIHNwZWNpZmllZCBlbnRpdHk6ICcsIHRoaXMuaWQpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbXBvbmVudCA9IGNjLmdldChjVHlwZSlcblxuICAgIGlmICghY29tcG9uZW50KSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBVbmFibGUgdG8gZmluZCBjb21wb25lbnQgb2YgdHlwZSAke2NUeXBlfSBpbiBlbnRpdHkgJHt0aGlzLmlkfWApO1xuICAgIH1cblxuXG4gICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgfVxuXG4gIGdldENvbXBvbmVudHMoKTogQ29tcG9uZW50Q29sbGVjdGlvbjxDVD4ge1xuICAgIHJldHVybiB0aGlzLndvcmxkLmNvbXBvbmVudENvbGxlY3Rpb25zLmdldCh0aGlzLmlkKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRW50aXR5PENUPihcbiAgd29ybGQ6IFdvcmxkPENUPixcbik6IEVudGl0eTxDVD4ge1xuICBjb25zdCBlbnRpdHkgPSBuZXcgRW50aXR5PENUPih3b3JsZCk7XG5cbiAgcmV0dXJuIGVudGl0eTtcbn1cblxuXG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/Entity.ts\n");

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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return World; });\n/* harmony import */ var _ComponentCollection__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ComponentCollection */ \"./src/ComponentCollection.ts\");\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n\nclass World {\n  constructor() {\n    _defineProperty(this, \"componentCollections\", new Map());\n\n    _defineProperty(this, \"entities\", new Map());\n\n    _defineProperty(this, \"entitiesByCTypes\", new Map());\n\n    _defineProperty(this, \"getEntitiesBy\", predicate => {\n      console.log('here!!');\n      const results = new Map();\n\n      for (const [entityId, entity] of this.entities) {\n        const cc = this.componentCollections.get(entityId);\n\n        if (predicate(entity, cc)) {\n          results.set(entity, cc);\n        }\n      }\n\n      return results;\n    });\n\n    _defineProperty(this, \"simulate\", func => {\n      func(this.componentCollections);\n    });\n\n    _defineProperty(this, \"set\", (eid, component) => {\n      const cc = this.componentCollections.get(eid) || new _ComponentCollection__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n      cc.add(component);\n      this.componentCollections.set(eid, cc);\n\n      for (const [ctArr, entitySet] of this.entitiesByCTypes) {\n        if (ctArr.every(cc.has)) {\n          entitySet.add(eid);\n        }\n      }\n    });\n  }\n\n  registerSystem(cTypes) {\n    this.entitiesByCTypes.set(cTypes, new Set());\n  }\n\n  registerEntity(entity) {\n    const cc = new _ComponentCollection__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n    this.componentCollections.set(entity.id, cc);\n    this.entities.set(entity.id, entity);\n  }\n\n  clearEntityComponents(eid) {\n    this.componentCollections.set(eid, new _ComponentCollection__WEBPACK_IMPORTED_MODULE_0__[\"default\"]());\n\n    for (const entitySet of this.entitiesByCTypes.values()) {\n      if (entitySet.has(eid)) {\n        entitySet.delete(eid);\n      }\n    }\n  }\n\n  destroyEntity(eid) {\n    this.componentCollections.delete(eid);\n    this.entities.delete(eid);\n\n    for (const entitySet of this.entitiesByCTypes.values()) {\n      if (entitySet.has(eid)) {\n        entitySet.delete(eid);\n      }\n    }\n  }\n\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lY3N0YXRpYy8uL3NyYy9Xb3JsZC50cz9jYzBiIl0sIm5hbWVzIjpbIldvcmxkIiwiTWFwIiwicHJlZGljYXRlIiwiY29uc29sZSIsImxvZyIsInJlc3VsdHMiLCJlbnRpdHlJZCIsImVudGl0eSIsImVudGl0aWVzIiwiY2MiLCJjb21wb25lbnRDb2xsZWN0aW9ucyIsImdldCIsInNldCIsImZ1bmMiLCJlaWQiLCJjb21wb25lbnQiLCJDb21wb25lbnRDb2xsZWN0aW9uIiwiYWRkIiwiY3RBcnIiLCJlbnRpdHlTZXQiLCJlbnRpdGllc0J5Q1R5cGVzIiwiZXZlcnkiLCJoYXMiLCJyZWdpc3RlclN5c3RlbSIsImNUeXBlcyIsIlNldCIsInJlZ2lzdGVyRW50aXR5IiwiaWQiLCJjbGVhckVudGl0eUNvbXBvbmVudHMiLCJ2YWx1ZXMiLCJkZWxldGUiLCJkZXN0cm95RW50aXR5Il0sIm1hcHBpbmdzIjoiOzs7OztBQUVBO0FBRWUsTUFBTUEsS0FBTixDQUFnQjtBQUFBO0FBQUEsa0RBQ2tDLElBQUlDLEdBQUosRUFEbEM7O0FBQUEsc0NBR1MsSUFBSUEsR0FBSixFQUhUOztBQUFBLDhDQUtnQixJQUFJQSxHQUFKLEVBTGhCOztBQUFBLDJDQU9aQyxTQUFELElBQXVIO0FBQ3JJQyxhQUFPLENBQUNDLEdBQVIsQ0FBWSxRQUFaO0FBQ0EsWUFBTUMsT0FBTyxHQUFHLElBQUlKLEdBQUosRUFBaEI7O0FBRUEsV0FBSyxNQUFNLENBQUNLLFFBQUQsRUFBV0MsTUFBWCxDQUFYLElBQWlDLEtBQUtDLFFBQXRDLEVBQWdEO0FBQzlDLGNBQU1DLEVBQUUsR0FBRyxLQUFLQyxvQkFBTCxDQUEwQkMsR0FBMUIsQ0FBOEJMLFFBQTlCLENBQVg7O0FBQ0EsWUFBSUosU0FBUyxDQUFDSyxNQUFELEVBQVNFLEVBQVQsQ0FBYixFQUEyQjtBQUN6QkosaUJBQU8sQ0FBQ08sR0FBUixDQUFZTCxNQUFaLEVBQW9CRSxFQUFwQjtBQUNEO0FBQ0Y7O0FBRUQsYUFBT0osT0FBUDtBQUNELEtBbkI0Qjs7QUFBQSxzQ0FxQmpCUSxJQUFELElBQTBCO0FBQ25DQSxVQUFJLENBQUMsS0FBS0gsb0JBQU4sQ0FBSjtBQUNELEtBdkI0Qjs7QUFBQSxpQ0F5QnZCLENBQUNJLEdBQUQsRUFBZ0JDLFNBQWhCLEtBQW1EO0FBQ3ZELFlBQU1OLEVBQUUsR0FBRyxLQUFLQyxvQkFBTCxDQUEwQkMsR0FBMUIsQ0FBOEJHLEdBQTlCLEtBQXNDLElBQUlFLDREQUFKLEVBQWpEO0FBRUFQLFFBQUUsQ0FBQ1EsR0FBSCxDQUFPRixTQUFQO0FBRUEsV0FBS0wsb0JBQUwsQ0FBMEJFLEdBQTFCLENBQThCRSxHQUE5QixFQUFtQ0wsRUFBbkM7O0FBRUEsV0FBSyxNQUFNLENBQUNTLEtBQUQsRUFBUUMsU0FBUixDQUFYLElBQWlDLEtBQUtDLGdCQUF0QyxFQUF3RDtBQUN0RCxZQUFJRixLQUFLLENBQUNHLEtBQU4sQ0FBWVosRUFBRSxDQUFDYSxHQUFmLENBQUosRUFBeUI7QUFDdkJILG1CQUFTLENBQUNGLEdBQVYsQ0FBY0gsR0FBZDtBQUNEO0FBQ0Y7QUFDRixLQXJDNEI7QUFBQTs7QUF1QzdCUyxnQkFBYyxDQUFDQyxNQUFELEVBQXFCO0FBQ2pDLFNBQUtKLGdCQUFMLENBQXNCUixHQUF0QixDQUEwQlksTUFBMUIsRUFBa0MsSUFBSUMsR0FBSixFQUFsQztBQUNEOztBQUVEQyxnQkFBYyxDQUFDbkIsTUFBRCxFQUEyQjtBQUN2QyxVQUFNRSxFQUFFLEdBQUcsSUFBSU8sNERBQUosRUFBWDtBQUVBLFNBQUtOLG9CQUFMLENBQTBCRSxHQUExQixDQUE4QkwsTUFBTSxDQUFDb0IsRUFBckMsRUFBeUNsQixFQUF6QztBQUNBLFNBQUtELFFBQUwsQ0FBY0ksR0FBZCxDQUFrQkwsTUFBTSxDQUFDb0IsRUFBekIsRUFBNkJwQixNQUE3QjtBQUNEOztBQUVEcUIsdUJBQXFCLENBQUNkLEdBQUQsRUFBc0I7QUFDekMsU0FBS0osb0JBQUwsQ0FBMEJFLEdBQTFCLENBQThCRSxHQUE5QixFQUFtQyxJQUFJRSw0REFBSixFQUFuQzs7QUFFQSxTQUFLLE1BQU1HLFNBQVgsSUFBd0IsS0FBS0MsZ0JBQUwsQ0FBc0JTLE1BQXRCLEVBQXhCLEVBQXdEO0FBQ3RELFVBQUlWLFNBQVMsQ0FBQ0csR0FBVixDQUFjUixHQUFkLENBQUosRUFBd0I7QUFDdEJLLGlCQUFTLENBQUNXLE1BQVYsQ0FBaUJoQixHQUFqQjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRGlCLGVBQWEsQ0FBQ2pCLEdBQUQsRUFBc0I7QUFDakMsU0FBS0osb0JBQUwsQ0FBMEJvQixNQUExQixDQUFpQ2hCLEdBQWpDO0FBQ0EsU0FBS04sUUFBTCxDQUFjc0IsTUFBZCxDQUFxQmhCLEdBQXJCOztBQUVBLFNBQUssTUFBTUssU0FBWCxJQUF3QixLQUFLQyxnQkFBTCxDQUFzQlMsTUFBdEIsRUFBeEIsRUFBd0Q7QUFDdEQsVUFBSVYsU0FBUyxDQUFDRyxHQUFWLENBQWNSLEdBQWQsQ0FBSixFQUF3QjtBQUN0QkssaUJBQVMsQ0FBQ1csTUFBVixDQUFpQmhCLEdBQWpCO0FBQ0Q7QUFDRjtBQUNGOztBQXJFNEIiLCJmaWxlIjoiLi9zcmMvV29ybGQudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRW50aXR5LCB7IEVudGl0eUlkIH0gZnJvbSAnLi9FbnRpdHknO1xuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IENvbXBvbmVudENvbGxlY3Rpb24gZnJvbSAnLi9Db21wb25lbnRDb2xsZWN0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV29ybGQ8Q1Q+IHtcbiAgY29tcG9uZW50Q29sbGVjdGlvbnM6IE1hcDxFbnRpdHlJZCwgQ29tcG9uZW50Q29sbGVjdGlvbjxDVD4+ID0gbmV3IE1hcCgpO1xuXG4gIGVudGl0aWVzOiBNYXA8RW50aXR5SWQsIEVudGl0eTxDVD4+ID0gbmV3IE1hcCgpO1xuXG4gIGVudGl0aWVzQnlDVHlwZXM6IE1hcDxDVFtdLCBTZXQ8RW50aXR5SWQ+PiA9IG5ldyBNYXAoKTtcblxuICBnZXRFbnRpdGllc0J5ID0gKHByZWRpY2F0ZTogKGVudGl0eTogRW50aXR5PENUPiwgY2M6IENvbXBvbmVudENvbGxlY3Rpb248Q1Q+KSA9PiBib29sZWFuKTogTWFwPEVudGl0eTxDVD4sIENvbXBvbmVudENvbGxlY3Rpb248Q1Q+PiA9PiB7XG4gICAgY29uc29sZS5sb2coJ2hlcmUhIScpO1xuICAgIGNvbnN0IHJlc3VsdHMgPSBuZXcgTWFwPEVudGl0eTxDVD4sIENvbXBvbmVudENvbGxlY3Rpb248Q1Q+PigpO1xuXG4gICAgZm9yIChjb25zdCBbZW50aXR5SWQsIGVudGl0eV0gb2YgdGhpcy5lbnRpdGllcykge1xuICAgICAgY29uc3QgY2MgPSB0aGlzLmNvbXBvbmVudENvbGxlY3Rpb25zLmdldChlbnRpdHlJZCk7XG4gICAgICBpZiAocHJlZGljYXRlKGVudGl0eSwgY2MpKSB7XG4gICAgICAgIHJlc3VsdHMuc2V0KGVudGl0eSwgY2MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgc2ltdWxhdGUgPSAoZnVuYzogRnVuY3Rpb24pOiB2b2lkID0+IHtcbiAgICBmdW5jKHRoaXMuY29tcG9uZW50Q29sbGVjdGlvbnMpO1xuICB9XG5cbiAgc2V0ID0gKGVpZDogRW50aXR5SWQsIGNvbXBvbmVudDogQ29tcG9uZW50PENUPik6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGNjID0gdGhpcy5jb21wb25lbnRDb2xsZWN0aW9ucy5nZXQoZWlkKSB8fCBuZXcgQ29tcG9uZW50Q29sbGVjdGlvbjxDVD4oKTtcblxuICAgIGNjLmFkZChjb21wb25lbnQpO1xuXG4gICAgdGhpcy5jb21wb25lbnRDb2xsZWN0aW9ucy5zZXQoZWlkLCBjYyk7XG5cbiAgICBmb3IgKGNvbnN0IFtjdEFyciwgZW50aXR5U2V0XSBvZiB0aGlzLmVudGl0aWVzQnlDVHlwZXMpIHtcbiAgICAgIGlmIChjdEFyci5ldmVyeShjYy5oYXMpKSB7XG4gICAgICAgIGVudGl0eVNldC5hZGQoZWlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZWdpc3RlclN5c3RlbShjVHlwZXM6IENUW10pOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0aWVzQnlDVHlwZXMuc2V0KGNUeXBlcywgbmV3IFNldDxFbnRpdHlJZD4oKSk7XG4gIH1cblxuICByZWdpc3RlckVudGl0eShlbnRpdHk6IEVudGl0eTxDVD4pOiB2b2lkIHtcbiAgICBjb25zdCBjYyA9IG5ldyBDb21wb25lbnRDb2xsZWN0aW9uPENUPigpO1xuXG4gICAgdGhpcy5jb21wb25lbnRDb2xsZWN0aW9ucy5zZXQoZW50aXR5LmlkLCBjYyk7XG4gICAgdGhpcy5lbnRpdGllcy5zZXQoZW50aXR5LmlkLCBlbnRpdHkpO1xuICB9XG5cbiAgY2xlYXJFbnRpdHlDb21wb25lbnRzKGVpZDogRW50aXR5SWQpOiB2b2lkIHtcbiAgICB0aGlzLmNvbXBvbmVudENvbGxlY3Rpb25zLnNldChlaWQsIG5ldyBDb21wb25lbnRDb2xsZWN0aW9uPENUPigpKTtcblxuICAgIGZvciAoY29uc3QgZW50aXR5U2V0IG9mIHRoaXMuZW50aXRpZXNCeUNUeXBlcy52YWx1ZXMoKSkge1xuICAgICAgaWYgKGVudGl0eVNldC5oYXMoZWlkKSkge1xuICAgICAgICBlbnRpdHlTZXQuZGVsZXRlKGVpZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveUVudGl0eShlaWQ6IEVudGl0eUlkKTogdm9pZCB7XG4gICAgdGhpcy5jb21wb25lbnRDb2xsZWN0aW9ucy5kZWxldGUoZWlkKTtcbiAgICB0aGlzLmVudGl0aWVzLmRlbGV0ZShlaWQpO1xuXG4gICAgZm9yIChjb25zdCBlbnRpdHlTZXQgb2YgdGhpcy5lbnRpdGllc0J5Q1R5cGVzLnZhbHVlcygpKSB7XG4gICAgICBpZiAoZW50aXR5U2V0LmhhcyhlaWQpKSB7XG4gICAgICAgIGVudGl0eVNldC5kZWxldGUoZWlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/World.ts\n");

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