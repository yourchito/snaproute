import * as fs from "fs";
import * as path from "path";
import { scaffoldRoute, ScaffoldOptions } from "./scaffoldRoute";

jest.mock("fs");

const mockedFs = fs as jest.Mocked<typeof fs>;

describe("scaffoldRoute", () => {
  const baseOptions: ScaffoldOptions = {
    routeName: "users",
    methods: ["GET", "POST"],
    outputDir: "src/pages/api",
    typescript: true,
    overwrite: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedFs.existsSync.mockReturnValue(false);
    mockedFs.mkdirSync.mockImplementation(() => undefined);
    mockedFs.writeFileSync.mockImplementation(() => undefined);
  });

  it("should scaffold a new route successfully", () => {
    const result = scaffoldRoute(baseOptions);

    expect(result.success).toBe(true);
    expect(result.filePath).toContain("users");
    expect(result.filePath).toContain(".ts");
    expect(result.message).toContain("scaffolded successfully");
    expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
  });

  it("should return failure if route exists and overwrite is false", () => {
    mockedFs.existsSync.mockReturnValue(true);

    const result = scaffoldRoute(baseOptions);

    expect(result.success).toBe(false);
    expect(result.message).toContain("already exists");
    expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
  });

  it("should overwrite route if overwrite option is true", () => {
    mockedFs.existsSync.mockReturnValue(true);

    const result = scaffoldRoute({ ...baseOptions, overwrite: true });

    expect(result.success).toBe(true);
    expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
  });

  it("should create directories recursively if they do not exist", () => {
    mockedFs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(false);

    scaffoldRoute(baseOptions);

    expect(mockedFs.mkdirSync).toHaveBeenCalledWith(
      expect.any(String),
      { recursive: true }
    );
  });

  it("should use .js extension when typescript is false", () => {
    const result = scaffoldRoute({ ...baseOptions, typescript: false });

    expect(result.filePath).toContain(".js");
  });
});
