package com.rsms.infrastructure.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.jcache.JCacheCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.cache.Caching;

/**
 * 캐싱 설정
 * - Ehcache 기본 사용 (Redis 추후 추가 가능)
 * - 프로필별 캐시 매니저 설정
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Ehcache 캐시 매니저 (기본)
     */
    @Bean
    @Profile("!redis")
    public CacheManager ehcacheCacheManager() {
        return new JCacheCacheManager(Caching.getCachingProvider().getCacheManager());
    }

    /**
     * Redis 캐시 매니저 (나중에 추가)
     * 
     * @Bean
     * @Profile("redis")
     * public CacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
     *     RedisCacheConfiguration cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
     *         .entryTtl(Duration.ofMinutes(10))
     *         .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
     *         .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
     *     
     *     return RedisCacheManager.builder(connectionFactory)
     *         .cacheDefaults(cacheConfig)
     *         .build();
     * }
     */
}