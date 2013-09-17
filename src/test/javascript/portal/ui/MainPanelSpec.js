
/*
 * Copyright 2012 IMOS
 *
 * The AODN/IMOS Portal is distributed under the terms of the GNU General Public License
 *
 */

describe("Portal.ui.MainPanel", function() {

    var mainPanel;

    beforeEach(function() {
        mainPanel = new Portal.ui.MainPanel();
    });

    afterEach(function() {
        Ext.MsgBus.unsubscribe('viewgeonetworkrecord', mainPanel._onViewGeoNetworkRecord, mainPanel);
    });

    describe('initialisation', function() {
        it('should init map panel', function() {
            expect(mainPanel.mapPanel).toBeInstanceOf(Portal.ui.MapPanel);
        });

        it('should init portal panel', function() {
            expect(mainPanel.visualisePanel).toBeInstanceOf(Portal.ui.VisualisePanel);
        });

        it('should init search panel', function() {
            expect(mainPanel.searchPanel).toBeInstanceOf(Portal.ui.search.SearchPanel);
            expect(mainPanel.searchPanel.mapPanel).toBe(mainPanel.mapPanel);
        });

        it('should init toolbar', function() {
            expect(mainPanel.getBottomToolbar()).toBeTruthy();
            expect(mainPanel.getBottomToolbar()).toBeInstanceOf(Portal.ui.MainToolbar);
        });
    });

    describe('card layout', function() {
        beforeEach(function() {
            mockLayoutForMainPanel(mainPanel);
        });

        it('creates an instance of Panel', function() {
            expect(mainPanel).toBeInstanceOf(Ext.Panel);
        });

        it('does not create an instance of TabPanel', function() {
            expect(mainPanel).not.toBeInstanceOf(Ext.TabPanel);
        });

        it('should set layout to cardlayout', function() {
            expect(mainPanel.layout).toBeInstanceOf(Ext.layout.CardLayout);
        });

        it('should initially have search as the active item', function() {
            expect(mainPanel.activeItem).toBe(TAB_INDEX_SEARCH);
        });

        it('should set visualise to active item when geonetwork record is viewed', function() {
            spyOn(mainPanel.layout, 'setActiveItem');
            Ext.MsgBus.publish('viewgeonetworkrecord');
            expect(mainPanel.layout.setActiveItem).toHaveBeenCalledWith(TAB_INDEX_VISUALISE);
        });

        it('should fire tabchange event', function() {
            var tabChangeSpy = jasmine.createSpy('tabchange');
            mainPanel.on('tabchange', tabChangeSpy);
            mainPanel.setActiveTab(0);
            expect(tabChangeSpy).toHaveBeenCalledWith(mainPanel);
        });
    });

    describe('main panel tab highlighting', function() {
        beforeEach(function() {
            mockLayoutForMainPanel(mainPanel);
            spyOn(mainPanel, "_highlightActiveTab");
        });

        it('on initial load', function() {
            spyOn(Portal.ui.MainPanel.superclass, "afterRender");
            mainPanel.afterRender();
            expect(mainPanel._highlightActiveTab).toHaveBeenCalled();
        });

        it('when switching tabs', function() {
            mainPanel.setActiveTab(0);
            expect(mainPanel._highlightActiveTab).toHaveBeenCalled();
        });
    });
});
