//
//  AppDelegate.swift
//  imgtv
//
//  Created by Marko Wallin on 7.11.2015.
//  Copyright © 2015 Rule of Tech. All rights reserved.
//

import UIKit
import TVMLKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, TVApplicationControllerDelegate {

    var window: UIWindow?

    var appController: TVApplicationController?
    static let TVBaseURL = "http://localhost:9001/"
    static let TVBootURL = "\(AppDelegate.TVBaseURL)js/application.js"
    
    func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
        self.window = UIWindow(frame: UIScreen.mainScreen().bounds)
        
        let appControllerContext = TVApplicationControllerContext()
        
        guard let jsFilePath = NSURL(string: AppDelegate.TVBootURL) else {
            fatalError("unable to create NSURL")
        }
        appControllerContext.javaScriptApplicationURL = jsFilePath
        appControllerContext.launchOptions["BASEURL"] = AppDelegate.TVBaseURL
        
        self.appController = TVApplicationController(context: appControllerContext, window: self.window, delegate: self)
        
        return true
    }
	
	// There's no console.log() in TVJS so we implement it (from https://medium.com/@rayh/get-started-building-tvml-tvjs-apps-on-apple-tvos-4f9a58847603)
	func appController(appController: TVApplicationController, evaluateAppJavaScriptInContext jsContext: JSContext) {
		jsContext.evaluateScript("var console = {log: function() { var message = ''; for(var i = 0; i < arguments.length; i++) { message += arguments[i] + ' ' }; console.print(message) } };")
		let logFunction: @convention(block) (NSString!) -> Void = { (message:NSString!) in
			print("JS: \(message)")
		}
		jsContext.objectForKeyedSubscript("console").setObject(unsafeBitCast(logFunction, AnyObject.self), forKeyedSubscript:"print")
	}
	
}

