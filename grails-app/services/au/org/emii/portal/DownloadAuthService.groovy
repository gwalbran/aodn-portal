package au.org.emii.portal

class DownloadAuthService {

    static transactional = true

    def grailsApplication
    def simpleCaptchaService

    def ipAddressAccountingMap = [:]

    def getEvictionPeriodMinutes() {
        return grailsApplication.config.downloadAuth.maxAggregatedDownloadsPeriodMinutes
    }

    def getEvictionPeriodMilliseconds() {
        return evictionPeriodMinutes * 60 * 1000
    }

    def verifyChallengeResponse(ipAddress, response) {

        if (needsChallenge(ipAddress)) {
            return simpleCaptchaService.validateCaptcha(response)
        }
        else {
            return true
        }
    }

    def isIpAddressTrusted(ipAddress) {
        def ipAddressTrusted = false

        grailsApplication.config.downloadAuth.trustedClients.each {
            if (ipAddress.matches(it)) {
                ipAddressTrusted = true
                log.info "Allowing $ipAddress to download without challenge because it is trusted ('$it')"
            }
        }

        // Check to see if IP is in rogueClients, treat it as a normal client
        // if it is
        if (ipAddressTrusted) {
            grailsApplication.config.downloadAuth.rogueClients.each {
                if (ipAddress.matches(it)) {
                    ipAddressTrusted = false
                    log.info "Challenging $ipAddress because it is a rogue '$it'"
                }
            }
        }

        return ipAddressTrusted
    }

    def needsChallenge(ipAddress) {

        def needsChallenge = false

        if (isAbusingUs(ipAddress)) {
            // downloadCount is the amount of already requested download + 1
            // which is the download the user has just requested
            def downloadCount         = downloadCountForIpAddress(ipAddress) + 1
            log.info "Seems like $ipAddress might be trying to abuse us, '$downloadCount' downloads in '$evictionPeriodMinutes' minutes"
            needsChallenge = true
        }
        else {
            // If we're not being abused by this IP address, we can just return
            // here without checking trustedClients and rogueClients
            return needsChallenge
        }

        return ! isIpAddressTrusted(ipAddress)
    }

    def resetChallenge(session) {
        session[simpleCaptchaService.CAPTCHA_IMAGE_ATTR] = null;
    }

    def downloadCountForIpAddress(ipAddress) {

        def downloadCount = 0

        if (ipAddressAccountingMap[ipAddress]) {
            downloadCount = ipAddressAccountingMap[ipAddress].size()
        }

        return downloadCount
    }

    def isAbusingUs(ipAddress) {
        return downloadCountForIpAddress(ipAddress) >= grailsApplication.config.downloadAuth.maxAggregatedDownloadsInPeriod
    }

    def registerDownloadForAddress(ipAddress, comment) {
        cleanIpAddressAccountingMap()

        if (!ipAddressAccountingMap[ipAddress]) {
            ipAddressAccountingMap[ipAddress] =
                new TimedEvictingQueue<String>(
                    [backlogIntervalMilli: evictionPeriodMilliseconds]
                )
        }
        ipAddressAccountingMap[ipAddress].add(comment)
    }

    def cleanIpAddressAccountingMap() {
        // Must run this or otherwise ipAddressAccountingMap can become inifinitely big
        ipAddressAccountingMap.entrySet().removeAll { it -> 0 == it.value.size() }
    }

}
