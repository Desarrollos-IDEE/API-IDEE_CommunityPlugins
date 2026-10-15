FROM tomcat:11.0.15-jdk17-temurin-noble

COPY ./ ${CATALINA_HOME}/webapps/API-IDEE_CommunityPlugins

EXPOSE 8080
