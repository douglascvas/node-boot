'use strict';

import * as chai from "chai";
import {Deprecated, DeprecatedHelper} from "../../../main/deprecation/Deprecated";
import {DeprecationInfo} from "../../../main/deprecation/DeprecationInfo";

const assert = chai.assert;

describe('Deprecated', function () {

  it('should register class deprecation with parameter', async function () {
    // given
    let deprecatedInfo: DeprecationInfo[] = DeprecatedHelper.getDeclaredDeprecations(DeprecatedClassWithDescription);

    // then
    assert.equal(deprecatedInfo[0].classz, DeprecatedClassWithDescription);
    assert.equal(deprecatedInfo[0].functionName, null);
    assert.equal(deprecatedInfo[0].message, "Class 'DeprecatedClassWithDescription' is deprecated and should not be used anymore. Better find another class.");
  });

  it('should register class deprecation without parameter', async function () {
    // given
    let deprecatedInfo: DeprecationInfo[] = DeprecatedHelper.getDeclaredDeprecations(DeprecatedClassWithoutDescription);

    // then
    assert.equal(deprecatedInfo[0].classz, DeprecatedClassWithoutDescription);
    assert.equal(deprecatedInfo[0].functionName, null);
    assert.equal(deprecatedInfo[0].message, "Class 'DeprecatedClassWithoutDescription' is deprecated and should not be used anymore.");
  });

  it('should register method deprecation with parameter', async function () {
    // given
    let deprecatedInfo: DeprecationInfo[] = DeprecatedHelper.getDeclaredDeprecations(ClassWithDeprecatedMethods);

    // then
    assert.equal(deprecatedInfo[0].classz, ClassWithDeprecatedMethods);
    assert.equal(deprecatedInfo[0].functionName, "deprecatedMethodWithMessage");
    assert.equal(deprecatedInfo[0].message, "Method 'ClassWithDeprecatedMethods.deprecatedMethodWithMessage' is deprecated and should not be used anymore. Better find another method.");
  });

  it('should register method deprecation without parameter', async function () {
    // given
    let deprecatedInfo: DeprecationInfo[] = DeprecatedHelper.getDeclaredDeprecations(ClassWithDeprecatedMethods);

    // then
    assert.equal(deprecatedInfo[1].classz, ClassWithDeprecatedMethods);
    assert.equal(deprecatedInfo[1].functionName, "deprecatedMethodWithoutMessage");
    assert.equal(deprecatedInfo[1].message, "Method 'ClassWithDeprecatedMethods.deprecatedMethodWithoutMessage' is deprecated and should not be used anymore.");
  });

  it('should register property deprecation with parameter', async function () {
    // given
    let deprecatedInfo: DeprecationInfo[] = DeprecatedHelper.getDeclaredDeprecations(ClassWithDeprecatedProperties);

    // then
    assert.equal(deprecatedInfo[0].classz, ClassWithDeprecatedProperties);
    assert.equal(deprecatedInfo[0].functionName, "deprecatedPropertyWithMessage");
    assert.equal(deprecatedInfo[0].message, "Property 'ClassWithDeprecatedProperties.deprecatedPropertyWithMessage' is deprecated and should not be used anymore. Better find another property.");
  });

  it('should register property deprecation without parameter', async function () {
    // given
    let deprecatedInfo: DeprecationInfo[] = DeprecatedHelper.getDeclaredDeprecations(ClassWithDeprecatedProperties);

    // then
    assert.equal(deprecatedInfo[1].classz, ClassWithDeprecatedProperties);
    assert.equal(deprecatedInfo[1].functionName, "deprecatedPropertyWithoutMessage");
    assert.equal(deprecatedInfo[1].message, "Property 'ClassWithDeprecatedProperties.deprecatedPropertyWithoutMessage' is deprecated and should not be used anymore.");
  });

  it('should register all deprecated items', async function () {
    // given
    let deprecatedInfo: DeprecationInfo[] = DeprecatedHelper.getDeclaredDeprecations(ClassWithMixedTypesOfDeprecation);

    // then
    assert.equal(deprecatedInfo[2].classz, ClassWithMixedTypesOfDeprecation);
    assert.equal(deprecatedInfo[2].functionName, null);
    assert.equal(deprecatedInfo[2].message, "Class 'ClassWithMixedTypesOfDeprecation' is deprecated and should not be used anymore. Sorry for this class!");

    assert.equal(deprecatedInfo[1].classz, ClassWithMixedTypesOfDeprecation);
    assert.equal(deprecatedInfo[1].functionName, "oldMethod");
    assert.equal(deprecatedInfo[1].message, "Method 'ClassWithMixedTypesOfDeprecation.oldMethod' is deprecated and should not be used anymore. Sorry for this method!");

    assert.equal(deprecatedInfo[0].classz, ClassWithMixedTypesOfDeprecation);
    assert.equal(deprecatedInfo[0].functionName, "oldProperty");
    assert.equal(deprecatedInfo[0].message, "Property 'ClassWithMixedTypesOfDeprecation.oldProperty' is deprecated and should not be used anymore. Sorry for this property!");
  });

  @Deprecated("Better find another class.")
  class DeprecatedClassWithDescription {
  }

  @Deprecated
  class DeprecatedClassWithoutDescription {
  }

  class ClassWithDeprecatedMethods {
    @Deprecated("Better find another method.")
    public deprecatedMethodWithMessage() {
    }

    @Deprecated
    public deprecatedMethodWithoutMessage() {
    }
  }

  class ClassWithDeprecatedProperties {
    @Deprecated("Better find another property.")
    private deprecatedPropertyWithMessage: string;
    @Deprecated
    private deprecatedPropertyWithoutMessage: string;
  }

  @Deprecated("Sorry for this class!")
  class ClassWithMixedTypesOfDeprecation {
    @Deprecated("Sorry for this property!")
    public oldProperty;

    @Deprecated("Sorry for this method!")
    public oldMethod(){
    }
  }

});