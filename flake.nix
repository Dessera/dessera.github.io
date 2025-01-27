{
  description = "Dessera's blog site using vuepress";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixcode = {
      url = "github:Dessera/nixcode";
      inputs.flake-parts.follows = "flake-parts";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    { flake-parts, ... }@inputs:
    flake-parts.lib.mkFlake { inherit inputs; } (
      { withSystem, ... }:
      {
        systems = [
          "x86_64-linux"
          "aarch64-linux"
          "x86_64-darwin"
          "aarch64-darwin"
        ];

        perSystem =
          { pkgs, system, ... }:
          let
            target = pkgs.callPackage ./default.nix { };
            code = withSystem system ({ inputs', ... }: inputs'.nixcode.packages.web);
          in
          {
            packages = {
              default = target;
            };

            devShells = {
              default = pkgs.mkShell {
                inputsFrom = [ target ];

                packages =
                  (with pkgs; [
                    nixd
                    nixfmt-rfc-style
                  ])
                  ++ [ code ];
              };
              corepack = pkgs.mkShell {
                packages = with pkgs; [
                  nixd
                  nixfmt-rfc-style

                  corepack
                ];
              };
            };
          };
      }
    );
}
