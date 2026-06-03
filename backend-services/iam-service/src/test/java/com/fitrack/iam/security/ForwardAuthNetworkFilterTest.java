package com.fitrack.iam.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ForwardAuthNetworkFilterTest {

    @Test
    void trustsDockerAndLoopbackAddresses() {
        assertThat(ForwardAuthNetworkFilter.isTrustedNetwork("127.0.0.1")).isTrue();
        assertThat(ForwardAuthNetworkFilter.isTrustedNetwork("10.0.0.5")).isTrue();
        assertThat(ForwardAuthNetworkFilter.isTrustedNetwork("172.18.0.2")).isTrue();
    }

    @Test
    void rejectsPublicAddresses() {
        assertThat(ForwardAuthNetworkFilter.isTrustedNetwork("8.8.8.8")).isFalse();
        assertThat(ForwardAuthNetworkFilter.isTrustedNetwork(null)).isFalse();
    }
}
