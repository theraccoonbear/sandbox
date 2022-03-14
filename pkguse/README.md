# pkguse - a package use search tool

## About

This is a small Node CLI tool that will help stitch together some grep commands to locate package usages in a Java project.

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

Scanning "/Users/dosmith/code/eventreg" for `com.rei.cms` imports...

Matches:
  * AssetDirectoryWebService
  * AssetDto
  * ComponentConfigurationDto
  * ContentWebService
  * PageConfigurationDto

Found 5 imports from `com.rei.cms`

Looking for class usages...

/eventreg/eventreg/src/main/java/com/rei/eventreg/config/ImageUriCacheConfig.java:22:    private ContentWebService contentWebService;
/eventreg/eventreg/src/main/java/com/rei/eventreg/config/ImageUriCacheConfig.java:23:    private AssetDirectoryWebService assetDirectoryWebService;
/eventreg/eventreg/src/main/java/com/rei/eventreg/config/ImageUriCacheConfig.java:29:            ContentWebService contentWebService, AssetDirectoryWebService assetDirectoryWebService,
/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:119:        PageConfigurationDto renderingPage = ((PageConfigurationDto) (renderingMap.get("renderingPage")));
/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:127:        Tuple2<Map<String, Object>, PageConfigurationDto> mapRequestTuple = pageName
/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:135:                    return Tuple.of(new HashMap<>(), new PageConfigurationDto());
/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:157:    private Optional<PageConfigurationDto> getPageConfigurationDto(String pageName, boolean preview) {
/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:166:    private Map<String, Object> generateModelMap(PageConfigurationDto pageConfigurationDto,
/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:174:        Map<String, ComponentConfigurationDto> componentConfigurations = pageConfigurationDto.getComponents();
/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:178:        List<Map.Entry<String, ComponentConfigurationDto>> componentsList =
/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:188:            List<Map.Entry<String, ComponentConfigurationDto>> componentsList) {
/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:190:            Map.Entry<String, ComponentConfigurationDto> entry = componentsList.get(i);
/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:198:            Map.Entry<String, ComponentConfigurationDto> entry) {
/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:209:    private void validateComponents(Map<String, ComponentConfigurationDto> componentConfigurationDtos) {
/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:210:        Map<String, ComponentConfigurationDto> problematicComponents = new HashMap<>();
/eventreg/eventreg/src/main/java/com/rei/eventreg/controller/CustomConfigurablePageController.java:226:    private void buildModelMapFromPageConfigDto(Map<String, Object> modelMap, PageConfigurationDto pageConfigDto) {
/eventreg/eventreg/src/main/java/com/rei/eventreg/cms/CmsServiceClientWrapper.java:25:    private ContentWebService contentWebService;
/eventreg/eventreg/src/main/java/com/rei/eventreg/cms/CmsServiceClientWrapper.java:28:    public CmsServiceClientWrapper(ContentWebService contentWebService, ConmanPropertyReferences conmanPropertyReferences) {
/eventreg/eventreg/src/main/java/com/rei/eventreg/service/ImageUriCacheService.java:37: * cache entry, otherwise, we utilize the ContentWebService and AssetDirectoryService to look up
/eventreg/eventreg/src/main/java/com/rei/eventreg/service/ImageUriCacheService.java:87:    private ContentWebService contentWebService;
/eventreg/eventreg/src/main/java/com/rei/eventreg/service/ImageUriCacheService.java:88:    private AssetDirectoryWebService assetDirectoryWebService;
/eventreg/eventreg/src/main/java/com/rei/eventreg/service/ImageUriCacheService.java:95:            ContentWebService contentWebService, AssetDirectoryWebService assetDirectoryWebService,
/eventreg/eventreg/src/main/java/com/rei/eventreg/service/ImageUriCacheService.java:224:            Map<String, AssetDto> assets = contentWebService.getAssetPaths(pdfFiles, preview);
/eventreg/eventreg/src/main/java/com/rei/eventreg/service/ImageUriCacheService.java:227:                    AssetDto assetDto = assets.get(file);
/eventreg/eventreg/src/main/java/com/rei/eventreg/service/ImageUriCacheService.java:284:            Map<String, AssetDto> assets = contentWebService.getAssetPaths(assetPaths, preview);

Found 25 _likely_ usages, or references to, these classes.
```

### Multiple search directories

You can perform the search across multiple paths by adding more directories...

`npm start -- --package com.rei.cms --dir /path/foo --dir /path/bar --dir /home/quux/code`

### Root pruning on output

If your code all lives in one place (e.g. `/home/username/code/....`) you can exclude that base path from the output by creating a `.env` file and including an entry like:

`CODE_ROOT=/home/username/code`

## Notes/Caveats

The tool will exclude file paths that match any of....
 * `*/src/test/*`
 * `*IT.java`
 * `*Test.java`