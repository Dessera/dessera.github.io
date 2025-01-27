{ 
  lib,
  callPackage 
}:

let

  project = callPackage ./yarn-project.nix {} {
    src = lib.cleanSource ./.;
  };

in 
project.overrideAttrs (oldAttrs: {
  buildPhase = ''
    runHook preBuild
    yarn docs:build
    runHook postBuild
  '';
})