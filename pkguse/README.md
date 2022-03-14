# pkguse - a package use search tool

## About

This is a small Node CLI tool that will help stich together some grep commands to locate package usages in a Java project.

## Usage

### Install Dependencies

`$ npm install`

### Usage

`npm start -- --package <package-name> --dir <search-root>`

e.g.

`npm start -- --package com.rei.cms --dir ~/code/eventreg`

```

> pkguse@1.0.0 start
> node index.js "--package" "com.rei.cms" "--dir" "/Users/dosmith/code/eventreg"

Scanning "/Users/dosmith/code/eventreg" for `com.rei.cms`...
Found 8 imports from `com.rei.cms`:
  * AssetDirectoryWebService
  * ContentWebService
  * ComponentConfigurationDto
  * PageConfigurationDto
  * ContentWebService
  * AssetDirectoryWebService
  * AssetDto
  * ContentWebService

Looking for class usages...

/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/config/ImageUriCacheConfig.java:22:    private ContentWebService contentWebService;
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/config/ImageUriCacheConfig.java:23:    private AssetDirectoryWebService assetDirectoryWebService;
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/config/ImageUriCacheConfig.java:29:            ContentWebService contentWebService, AssetDirectoryWebService assetDirectoryWebService,
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:119:        PageConfigurationDto renderingPage = ((PageConfigurationDto) (renderingMap.get("renderingPage")));
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:127:        Tuple2<Map<String, Object>, PageConfigurationDto> mapRequestTuple = pageName
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:129:                .map(page -> getPageConfigurationDto(page, preview))
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:135:                    return Tuple.of(new HashMap<>(), new PageConfigurationDto());
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:157:    private Optional<PageConfigurationDto> getPageConfigurationDto(String pageName, boolean preview) {
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:160:                    LOG.warn("Error while executing method CustomConfigurablePageController.getPageConfigurationDto",
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:166:    private Map<String, Object> generateModelMap(PageConfigurationDto pageConfigurationDto,
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:174:        Map<String, ComponentConfigurationDto> componentConfigurations = pageConfigurationDto.getComponents();
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:178:        List<Map.Entry<String, ComponentConfigurationDto>> componentsList =
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:188:            List<Map.Entry<String, ComponentConfigurationDto>> componentsList) {
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:190:            Map.Entry<String, ComponentConfigurationDto> entry = componentsList.get(i);
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:198:            Map.Entry<String, ComponentConfigurationDto> entry) {
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:209:    private void validateComponents(Map<String, ComponentConfigurationDto> componentConfigurationDtos) {
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:210:        Map<String, ComponentConfigurationDto> problematicComponents = new HashMap<>();
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:226:    private void buildModelMapFromPageConfigDto(Map<String, Object> modelMap, PageConfigurationDto pageConfigDto) {
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/GlobalErrorsAndAttributesHandler.java:5:import com.rei.components.common.dto.FrontEndResourceAssetDto;
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/GlobalErrorsAndAttributesHandler.java:317:    private FrontEndResourceAssetDto unav(Boolean preview) {
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/GlobalErrorsAndAttributesHandler.java:321:    private FrontEndResourceAssetDto gnav(Boolean preview) {
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/GlobalErrorsAndAttributesHandler.java:325:    private FrontEndResourceAssetDto footer(Boolean preview) {
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/GlobalErrorsAndAttributesHandler.java:329:    private FrontEndResourceAssetDto swb(Boolean preview) {
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/GlobalErrorsAndAttributesHandler.java:333:    private FrontEndResourceAssetDto getComponent(Supplier<FrontEndResourceAssetDto> componentsCall) {
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/GlobalErrorsAndAttributesHandler.java:334:        FrontEndResourceAssetDto component = null;
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/cms/CmsServiceClientWrapper.java:25:    private ContentWebService contentWebService;
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/cms/CmsServiceClientWrapper.java:28:    public CmsServiceClientWrapper(ContentWebService contentWebService, ConmanPropertyReferences conmanPropertyReferences) {
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/service/ImageUriCacheService.java:37: * cache entry, otherwise, we utilize the ContentWebService and AssetDirectoryService to look up
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/service/ImageUriCacheService.java:87:    private ContentWebService contentWebService;
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/service/ImageUriCacheService.java:88:    private AssetDirectoryWebService assetDirectoryWebService;
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/service/ImageUriCacheService.java:95:            ContentWebService contentWebService, AssetDirectoryWebService assetDirectoryWebService,
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/service/ImageUriCacheService.java:224:            Map<String, AssetDto> assets = contentWebService.getAssetPaths(pdfFiles, preview);
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/service/ImageUriCacheService.java:227:                    AssetDto assetDto = assets.get(file);
/Users/dosmith/code/eventreg/eventreg/src/main/java/com/rei/eventreg/service/ImageUriCacheService.java:284:            Map<String, AssetDto> assets = contentWebService.getAssetPaths(assetPaths, preview);

Found 34 _likely_ usages, or references to, these classes.
```

## Notes/Caveats

The tool will exclude file paths that match any of....
 * `*/src/test/*`
 * `*IT.java`
 * `*Test.java`