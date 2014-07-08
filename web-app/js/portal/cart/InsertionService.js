/*
 * Copyright 2014 IMOS
 *
 * The AODN/IMOS Portal is distributed under the terms of the GNU General Public License
 *
 */

Ext.namespace('Portal.cart');

Portal.cart.InsertionService = Ext.extend(Object, {

    constructor: function(downloadPanel) {

        this.downloadPanel = downloadPanel;
    },

    insertionValues: function(collection) {

        var config = {
            downloadConfirmation: this.downloadWithConfirmation,
            downloadConfirmationScope: this
        };

        var wmsLayer = collection.wmsLayer;
        var htmlInjection;

        if (this._isCollectionDownloadable(collection)) {
            if (this._isNcwmsLayerWithData(wmsLayer)) {
                htmlInjection = this._getNcwmsInjector(config, collection);
            }
            else {
                htmlInjection = this._getWmsInjector(config, collection);
            }
        }
        else {
            htmlInjection = this._getNoDataInjector(config, collection);
        }

        return htmlInjection.getInjectionJson(collection);
    },

    _isCollectionDownloadable: function(collection) {
        return collection.dataDownloadHandlers && (collection.dataDownloadHandlers.length > 0);
    },

    _isNcwmsLayerWithData: function(wmsLayer) {
        return wmsLayer.isNcwms() && (this._hasGeonetworkLayerName(wmsLayer) || this._hasAodaacProductId(wmsLayer));
    },

    _hasGeonetworkLayerName: function(wmsLayer) {
        var wfsLayer = wmsLayer.wfsLayer;
        return (wfsLayer && wfsLayer.name) || wmsLayer.gogoduckLayerName || wmsLayer.urlDownloadFieldName;
    },

    _hasAodaacProductId: function(wmsLayer) {
        var aodaacProducts = wmsLayer.aodaacProducts;
        return aodaacProducts && aodaacProducts[0] && aodaacProducts[0].id;
    },

    _getNcwmsInjector: function(config, collection) {

        if (!this.ncwmsInjector) {
            this.ncwmsInjector = new Portal.cart.NcwmsInjector(config);
        }

        return this.ncwmsInjector;
    },

    _getWmsInjector: function(config, collection) {

        if (!this.wmsInjector) {
            this.wmsInjector = new Portal.cart.WmsInjector(config);
        }

        return this.wmsInjector;
    },

    _getNoDataInjector: function(config, collection) {

        if (!this.noDataInjector) {
            this.noDataInjector = new Portal.cart.NoDataInjector(config);
        }

        return this.noDataInjector;
    },

    downloadWithConfirmation: function(collection, generateUrlCallbackScope, generateUrlCallback, params) {
        this.downloadPanel.confirmDownload(collection, generateUrlCallbackScope, generateUrlCallback, params);
    }
});
