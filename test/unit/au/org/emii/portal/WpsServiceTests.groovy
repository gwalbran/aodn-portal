package au.org.emii.portal

import grails.test.*

class WpsServiceTests extends GrailsUnitTestCase {
    WpsService service

    @Override
    void setUp() {
        super.setUp()

        service = new WpsService()

    }

    void testGetConnection() {

        def connection = service.getConnection([ server: 'myserver' ])

        assertNotNull connection
        assertEquals 'myserver', String.valueOf(connection.uri)
        assertEquals groovyx.net.http.ContentType.XML, connection.contentType
    }

    void testGetExecutionStatusUrl() {
        assertEquals(
            "the url?service=WPS&version=1.0.0&request=GetExecutionStatus&executionId=1234",
            service._getExecutionStatusUrl(server: 'the url', uuid: '1234')
        )
    }

    void testGetBody() {
        def params = [ jobParameters: [ typeName: 'an awesome layer', cqlFilter: 'some cql' ] ]
        def called = false

        service.groovyPageRenderer = [
            render: { args ->
                called = true

                assertEquals '/wps/asyncRequest.xml', args.template
                assertEquals params, args.model
            }
        ]

        service.getBody(params)
        assertTrue called
    }
}
